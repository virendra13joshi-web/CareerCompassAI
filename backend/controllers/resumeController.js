const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const { pool } = require('../config/db');
const { createNotification, sendEmailNotification } = require('../services/notificationService');

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── ATS Analysis System Prompt ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst and career counselor with 15+ years of experience reviewing resumes for top tech companies. Your job is to analyze the provided resume text and return a comprehensive, structured JSON analysis.

You MUST return ONLY a valid JSON object (no markdown, no extra text) with this EXACT structure:
{
  "ats_score": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "section_scores": {
    "contact_info": <0-100>,
    "professional_summary": <0-100>,
    "work_experience": <0-100>,
    "education": <0-100>,
    "skills": <0-100>,
    "projects": <0-100>,
    "certifications": <0-100>
  },
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "weaknesses": [
    "<specific weakness 1>",
    "<specific weakness 2>"
  ],
  "missing_keywords": [
    "<important ATS keyword missing from resume>",
    "<another missing keyword>"
  ],
  "formatting_issues": [
    "<formatting problem 1>",
    "<formatting problem 2>"
  ],
  "suggestions": [
    "<actionable improvement suggestion 1>",
    "<actionable improvement suggestion 2>",
    "<actionable improvement suggestion 3>",
    "<actionable improvement suggestion 4>",
    "<actionable improvement suggestion 5>"
  ]
}

ATS Score Rubric:
- 90-100: Excellent — Well-optimized, passes most ATS filters
- 75-89: Good — Minor improvements needed
- 60-74: Average — Several key improvements required  
- 40-59: Poor — Major restructuring recommended
- 0-39: Very Poor — Fundamental issues present

Be specific, honest, and actionable. Reference exact details from the resume in your analysis.`;

// ─── Mock Analysis (fallback when no API key) ─────────────────────────────────
function generateMockAnalysis(resumeText) {
  const wordCount = resumeText.split(/\s+/).length;
  const hasContact = /email|phone|\d{10}|@/i.test(resumeText);
  const hasExperience = /experience|intern|work|employ/i.test(resumeText);
  const hasEducation = /education|university|college|degree|b\.tech|bsc|mca/i.test(resumeText);
  const hasSkills = /skills|technologies|tools|languages/i.test(resumeText);
  const hasProjects = /project|developed|built|created/i.test(resumeText);

  let score = 40;
  if (hasContact) score += 10;
  if (hasExperience) score += 15;
  if (hasEducation) score += 10;
  if (hasSkills) score += 15;
  if (hasProjects) score += 10;
  if (wordCount > 300) score += 5;

  return {
    ats_score: Math.min(score, 95),
    summary: `Your resume has been analyzed. It contains approximately ${wordCount} words. The resume ${hasContact ? 'includes' : 'is missing'} contact information and ${hasExperience ? 'has' : 'lacks'} visible work experience. Note: This is a demo analysis. Add an OPENAI_API_KEY to your .env for full AI-powered analysis.`,
    section_scores: {
      contact_info: hasContact ? 85 : 20,
      professional_summary: 55,
      work_experience: hasExperience ? 70 : 10,
      education: hasEducation ? 80 : 30,
      skills: hasSkills ? 75 : 20,
      projects: hasProjects ? 70 : 30,
      certifications: 40
    },
    strengths: [
      hasExperience ? 'Work experience section is present' : 'Resume has a clean structure',
      hasSkills ? 'Skills section is clearly listed' : 'Education section is well-documented',
      hasProjects ? 'Projects demonstrate practical experience' : 'Contact information is present'
    ],
    weaknesses: [
      'Missing quantifiable achievements (use numbers like "Improved performance by 40%")',
      'Professional summary could be stronger and more targeted',
      hasSkills ? 'Consider adding skill proficiency levels' : 'Skills section needs to be added'
    ],
    missing_keywords: ['GitHub profile URL', 'LinkedIn URL', 'Quantified metrics', 'Leadership keywords', 'Team collaboration experience'],
    formatting_issues: [
      'Ensure consistent font sizes throughout the document',
      'Use bullet points instead of paragraphs for experience descriptions',
      'Keep resume to 1-2 pages maximum'
    ],
    suggestions: [
      'Add a compelling 2-3 sentence professional summary at the top tailored to your target role',
      'Quantify all achievements with specific metrics (e.g., "Reduced load time by 35%")',
      'Include relevant keywords from job descriptions to pass ATS filters',
      'Add a direct link to your GitHub profile with pinned repositories',
      'Tailor your skills section to match requirements in target job descriptions'
    ]
  };
}

// ─── Controller: Analyze Resume ──────────────────────────────────────────────
exports.analyzeResume = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    filePath = req.file.path;
    const filename = req.file.filename;
    const resumeUrl = `/uploads/${filename}`;

    // Step 1: Extract text from PDF
    let rawText = '';
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      rawText = pdfData.text?.trim() || '';
    } catch (parseErr) {
      console.error('PDF parse error:', parseErr.message);
      return res.status(422).json({ message: 'Could not read the PDF. Please ensure it is a text-based PDF, not a scanned image.' });
    }

    if (rawText.length < 50) {
      return res.status(422).json({ message: 'The PDF appears to contain no readable text. Please upload a text-based PDF resume.' });
    }

    // Step 2: AI Analysis (or mock fallback)
    let analysis;
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('⚠️  No OpenAI API key found — using mock analysis.');
      analysis = generateMockAnalysis(rawText);
    } else {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Please analyze the following resume text and return a JSON analysis:\n\n---RESUME START---\n${rawText.substring(0, 8000)}\n---RESUME END---`
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        });

        const rawJson = completion.choices[0]?.message?.content;
        analysis = JSON.parse(rawJson);
      } catch (aiErr) {
        console.error('OpenAI error:', aiErr.message);
        // Fall back to mock rather than crashing
        analysis = generateMockAnalysis(rawText);
        analysis.summary = '[AI service temporarily unavailable — showing estimated analysis] ' + analysis.summary;
      }
    }

    // Step 3: Validate fields
    const {
      ats_score = 50, summary = '', section_scores = {},
      strengths = [], weaknesses = [], missing_keywords = [],
      formatting_issues = [], suggestions = []
    } = analysis;

    // Step 4: Save to MySQL
    const studentId = req.user?.id || null;
    const [dbResult] = await pool.execute(
      `INSERT INTO resume_reports
        (student_id, resume_filename, resume_url, raw_text, ats_score, summary,
         strengths, weaknesses, missing_keywords, formatting_issues, suggestions, section_scores)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        filename,
        resumeUrl,
        rawText.substring(0, 65000), // LONGTEXT cap
        ats_score,
        summary,
        JSON.stringify(strengths),
        JSON.stringify(weaknesses),
        JSON.stringify(missing_keywords),
        JSON.stringify(formatting_issues),
        JSON.stringify(suggestions),
        JSON.stringify(section_scores)
      ]
    );

    res.json({
      reportId: dbResult.insertId,
      filename,
      resumeUrl,
      ats_score,
      summary,
      section_scores,
      strengths,
      weaknesses,
      missing_keywords,
      formatting_issues,
      suggestions,
      analyzed_at: new Date().toISOString()
    });

    // Send notification to the student after responding
    if (req.user?.id) {
      createNotification(
        req.user.id,
        'resume_done',
        '📊 Resume Analysis Complete!',
        `Your resume has been analyzed. ATS Score: **${ats_score}/100**. ${ats_score >= 75 ? 'Great job!' : 'Check your report for detailed improvement suggestions.'}`
      );
      // Also send email if student email is available
      if (req.user.email) {
        sendEmailNotification(
          req.user.email,
          'Resume Analysis Complete!',
          `Your resume analysis is complete. ATS Score: ${ats_score}/100. Log in to CareerCompass AI to view your detailed report.`
        );
      }
    }

  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'An error occurred during analysis. Please try again.' });
  }
};

// ─── Controller: Get Report History ──────────────────────────────────────────
exports.getMyReports = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, resume_filename, ats_score, summary, created_at
       FROM resume_reports
       WHERE student_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── Controller: Get Single Report ───────────────────────────────────────────
exports.getReportById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM resume_reports WHERE id = ? AND student_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Report not found.' });

    const report = rows[0];
    // Parse JSON fields
    ['strengths', 'weaknesses', 'missing_keywords', 'formatting_issues', 'suggestions', 'section_scores'].forEach(field => {
      if (typeof report[field] === 'string') {
        try { report[field] = JSON.parse(report[field]); } catch (e) { report[field] = []; }
      }
    });

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
