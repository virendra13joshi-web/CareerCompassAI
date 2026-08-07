const OpenAI = require('openai');
const { pool } = require('../config/db');
const { createNotification } = require('../services/notificationService');

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── System Prompt for Roadmap Generation ──────────────────────────────────────
const SYSTEM_PROMPT = `You are a world-class placement mentor and curriculum designer for Indian tech placements.
Your job is to build a structured, custom preparation roadmap based on:
1. Target Dream Company
2. Current Student Skills
3. Target Placement Date

You MUST return ONLY a valid JSON object with EXACTLY this structure (no markdown wrapper, no extra text):
{
  "summary": "<2-sentence overview of the target company strategy>",
  "daily_plan": [
    {"id": "daily_1", "task": "<Specific daily habit/task e.g. Solve 2 LeetCode Mediums>", "time": "2 Hours"},
    {"id": "daily_2", "task": "<Revision task>", "time": "1 Hour"}
  ],
  "weekly_plan": [
    {"id": "week_1", "title": "Week 1: Core Foundation", "tasks": ["<Task 1>", "<Task 2>"]},
    {"id": "week_2", "title": "Week 2: Advanced Topics", "tasks": ["<Task 1>", "<Task 2>"]}
  ],
  "monthly_plan": [
    {"id": "month_1", "title": "Month 1: Fundamentals & DSA", "focus": "<Key goal for Month 1>"},
    {"id": "month_2", "title": "Month 2: Mock Interviews & System Prep", "focus": "<Key goal for Month 2>"}
  ],
  "dsa_roadmap": [
    {"id": "dsa_1", "topic": "Arrays & Hashing", "key_problems": ["Two Sum", "Group Anagrams"], "estimated_days": "5 Days"},
    {"id": "dsa_2", "topic": "Two Pointers & Sliding Window", "key_problems": ["3Sum", "Container With Most Water"], "estimated_days": "4 Days"},
    {"id": "dsa_3", "topic": "Trees & Graphs", "key_problems": ["Inorder Traversal", "Number of Islands"], "estimated_days": "7 Days"},
    {"id": "dsa_4", "topic": "Dynamic Programming", "key_problems": ["Climbing Stairs", "Coin Change"], "estimated_days": "8 Days"}
  ],
  "sql_roadmap": [
    {"id": "sql_1", "topic": "Basic Queries & Joins", "task": "Master INNER, LEFT, RIGHT JOINs with subqueries"},
    {"id": "sql_2", "topic": "Window Functions", "task": "Practice RANK(), DENSE_RANK(), ROW_NUMBER(), LEAD(), LAG()"}
  ],
  "dbms_roadmap": [
    {"id": "dbms_1", "topic": "ACID Properties & Transactions", "task": "Study Atomicity, Consistency, Isolation, Durability"},
    {"id": "dbms_2", "topic": "Normalization", "task": "Learn 1NF, 2NF, 3NF, BCNF with real-world table examples"}
  ],
  "oop_roadmap": [
    {"id": "oop_1", "topic": "4 Pillars of OOP", "task": "Implement Encapsulation, Abstraction, Inheritance, Polymorphism"},
    {"id": "oop_2", "topic": "SOLID Principles", "task": "Learn Single Responsibility, Open-Closed, Liskov, Interface Segregation, Dependency Inversion"}
  ],
  "aptitude_plan": [
    {"id": "apt_1", "topic": "Quantitative Aptitude", "task": "Practice Time & Work, Speed & Distance, Percentages, Profit & Loss"},
    {"id": "apt_2", "topic": "Logical Reasoning", "task": "Master Blood Relations, Coding-Decoding, Seating Arrangement"}
  ],
  "mock_interview_plan": [
    {"id": "mock_1", "stage": "Phase 1: Peer Mocks", "task": "Complete 3 peer-to-peer technical mock interviews"},
    {"id": "mock_2", "stage": "Phase 2: Full Simulation", "task": "Complete 2 timed 60-minute mock interviews matching company format"}
  ]
}`;

// ─── Mock Roadmap Generator ───────────────────────────────────────────────────
function generateMockRoadmap(company, skillsStr, targetDate) {
  return {
    summary: `Tailored roadmap to crack ${company}. Focuses on filling your skill gaps while strengthening core CS fundamentals ahead of ${targetDate || 'your target date'}.`,
    daily_plan: [
      { id: "daily_1", task: "Solve 2 LeetCode Medium DSA problems", time: "2 Hours" },
      { id: "daily_2", task: "Revise 1 Core CS subject (DBMS / SQL / OOP / OS)", time: "1 Hour" },
      { id: "daily_3", task: "Practice 15 Quantitative Aptitude questions", time: "45 Mins" },
      { id: "daily_4", task: "Read 1 System Design or Technical concept summary", time: "30 Mins" }
    ],
    weekly_plan: [
      { id: "week_1", title: "Week 1: Data Structures Mastery", tasks: ["Arrays, Hashing & String Manipulation", "Two Pointers & Sliding Window techniques"] },
      { id: "week_2", title: "Week 2: Advanced DSA & SQL", tasks: ["Trees, Binary Search Trees & BFS/DFS", "SQL Window functions and complex JOIN queries"] },
      { id: "week_3", title: "Week 3: Core CS & System Basics", tasks: ["DBMS Normalization & ACID Properties", "OOP 4 Pillars & SOLID Principles"] },
      { id: "week_4", title: "Week 4: Company Patterns & Mock Interviews", tasks: [`Practice previous year ${company} questions`, "Conduct 2 full-length timed mock interviews"] }
    ],
    monthly_plan: [
      { id: "month_1", title: "Month 1: High-Yield Fundamentals", focus: "Complete top 100 LeetCode patterns and core SQL queries." },
      { id: "month_2", title: "Month 2: Company-Specific Speed & Mocks", focus: `Solve real ${company} past interview questions and refine HR STAR answers.` }
    ],
    dsa_roadmap: [
      { id: "dsa_1", topic: "Arrays & Hashing", key_problems: ["Two Sum", "Valid Anagram", "Group Anagrams"], estimated_days: "4 Days" },
      { id: "dsa_2", topic: "Two Pointers & Sliding Window", key_problems: ["3Sum", "Container With Most Water", "Longest Substring Without Repeating Characters"], estimated_days: "5 Days" },
      { id: "dsa_3", topic: "Trees & Graphs", key_problems: ["Binary Tree Inorder Traversal", "Lowest Common Ancestor", "Number of Islands"], estimated_days: "7 Days" },
      { id: "dsa_4", topic: "Dynamic Programming", key_problems: ["Climbing Stairs", "Coin Change", "Longest Increasing Subsequence"], estimated_days: "8 Days" }
    ],
    sql_roadmap: [
      { id: "sql_1", topic: "Joins & Subqueries", task: "Master INNER, LEFT, RIGHT JOINs and correlated subqueries" },
      { id: "sql_2", topic: "Window Functions", task: "Practice RANK(), DENSE_RANK(), ROW_NUMBER(), LEAD(), LAG()" },
      { id: "sql_3", topic: "Aggregations", task: "Master GROUP BY, HAVING, COUNT(DISTINCT), and CASE statements" }
    ],
    dbms_roadmap: [
      { id: "dbms_1", topic: "ACID Properties & Transactions", task: "Understand Isolation levels, Locking, and Deadlocks" },
      { id: "dbms_2", topic: "Normalization", task: "Study 1NF, 2NF, 3NF, BCNF with table decomposition examples" },
      { id: "dbms_3", topic: "Indexing", task: "Learn B-Tree vs Hash indexes, Clustered vs Non-Clustered" }
    ],
    oop_roadmap: [
      { id: "oop_1", topic: "Four Pillars of OOP", task: "Implement Encapsulation, Abstraction, Inheritance, Polymorphism" },
      { id: "oop_2", topic: "SOLID Principles", task: "Learn Single Responsibility, Open-Closed, Liskov, Interface Segregation, Dependency Inversion" },
      { id: "oop_3", topic: "Design Patterns", task: "Study Singleton, Factory, and Observer patterns with code" }
    ],
    aptitude_plan: [
      { id: "apt_1", topic: "Quantitative Aptitude", task: "Practice Time & Work, Speed & Distance, Percentages, Profit & Loss" },
      { id: "apt_2", topic: "Logical Reasoning", task: "Master Blood Relations, Coding-Decoding, Seating Arrangement, Syllogisms" }
    ],
    mock_interview_plan: [
      { id: "mock_1", stage: "Phase 1: Peer Technical Mocks", task: "Complete 3 peer-to-peer technical mock interviews covering DSA" },
      { id: "mock_2", stage: "Phase 2: HR & Behavioral Mocks", task: "Prepare 5 STAR stories and practice with an AI or mentor" },
      { id: "mock_3", stage: "Phase 3: Company Simulation", task: `Complete 2 full-length 60-min simulated interviews tailored for ${company}` }
    ]
  };
}

// ─── Controller: Generate Roadmap ─────────────────────────────────────────────
exports.generateRoadmap = async (req, res) => {
  try {
    const { dream_company, current_skills, target_date } = req.body;
    const studentId = req.user.id;

    if (!dream_company) {
      return res.status(400).json({ message: 'Dream Company is required.' });
    }

    const skillsStr = Array.isArray(current_skills) ? current_skills.join(', ') : (current_skills || 'General CS');

    let roadmapData;
    const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

    if (hasApiKey) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Target Company: ${dream_company}\nCurrent Skills: ${skillsStr}\nTarget Placement Date: ${target_date || 'Within 3 months'}`
            }
          ],
          temperature: 0.5,
          response_format: { type: 'json_object' }
        });

        roadmapData = JSON.parse(completion.choices[0]?.message?.content);
      } catch (aiErr) {
        console.error('OpenAI Roadmap error:', aiErr.message);
        roadmapData = generateMockRoadmap(dream_company, skillsStr, target_date);
      }
    } else {
      roadmapData = generateMockRoadmap(dream_company, skillsStr, target_date);
    }

    // Deactivate previous active roadmaps for this student by creating a fresh one
    const [result] = await pool.execute(
      `INSERT INTO roadmaps (student_id, dream_company, current_skills, target_date, roadmap_data)
       VALUES (?, ?, ?, ?, ?)`,
      [
        studentId,
        dream_company,
        JSON.stringify(Array.isArray(current_skills) ? current_skills : (current_skills || '').split(',').map(s => s.trim())),
        target_date || null,
        JSON.stringify(roadmapData)
      ]
    );

    res.status(201).json({
      roadmap_id: result.insertId,
      dream_company,
      target_date,
      roadmap: roadmapData,
      completed_tasks: []
    });

    // Notify the student that their roadmap is ready
    createNotification(
      studentId,
      'roadmap_updated',
      '🚀 Your Placement Roadmap is Ready!',
      `Your AI-powered preparation roadmap to crack **${dream_company}** has been generated! Check your Daily Plan, DSA Roadmap, SQL, OOP, and Mock Interview schedules.`
    );
  } catch (error) {
    console.error('Generate Roadmap Error:', error);
    res.status(500).json({ message: 'Server error generating roadmap.' });
  }
};

// ─── Controller: Get Active Roadmap & Progress ─────────────────────────────────
exports.getActiveRoadmap = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get latest roadmap
    const [roadmaps] = await pool.execute(
      `SELECT * FROM roadmaps WHERE student_id = ? ORDER BY created_at DESC LIMIT 1`,
      [studentId]
    );

    if (!roadmaps[0]) {
      return res.json({ active: false });
    }

    const rm = roadmaps[0];
    let roadmapData = typeof rm.roadmap_data === 'string' ? JSON.parse(rm.roadmap_data) : rm.roadmap_data;

    // Get completed tasks
    const [progressRows] = await pool.execute(
      `SELECT task_id FROM roadmap_progress WHERE roadmap_id = ? AND student_id = ? AND completed = TRUE`,
      [rm.id, studentId]
    );

    const completedTaskIds = progressRows.map(r => r.task_id);

    res.json({
      active: true,
      roadmap_id: rm.id,
      dream_company: rm.dream_company,
      target_date: rm.target_date,
      created_at: rm.created_at,
      roadmap: roadmapData,
      completed_tasks: completedTaskIds
    });
  } catch (error) {
    console.error('Get Active Roadmap Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── Controller: Toggle Task Completion ──────────────────────────────────────
exports.toggleTask = async (req, res) => {
  try {
    const { roadmap_id, task_id, completed } = req.body;
    const studentId = req.user.id;

    if (!roadmap_id || !task_id) {
      return res.status(400).json({ message: 'roadmap_id and task_id are required.' });
    }

    if (completed) {
      await pool.execute(
        `INSERT INTO roadmap_progress (roadmap_id, student_id, task_id, completed)
         VALUES (?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE completed = TRUE`,
        [roadmap_id, studentId, task_id]
      );
    } else {
      await pool.execute(
        `DELETE FROM roadmap_progress WHERE roadmap_id = ? AND student_id = ? AND task_id = ?`,
        [roadmap_id, studentId, task_id]
      );
    }

    res.json({ success: true, task_id, completed });
  } catch (error) {
    console.error('Toggle Task Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
