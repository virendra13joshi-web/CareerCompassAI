const { pool } = require('../config/db');
const Company = require('../models/Company');

// ─────────────────────────────────────────────
// Learning Path Knowledge Base
// Maps a skill keyword -> structured learning path
// ─────────────────────────────────────────────
const LEARNING_PATHS = {
  react: {
    title: 'React.js',
    steps: [
      '1. Master JavaScript ES6+ fundamentals (arrow functions, destructuring, modules)',
      '2. Learn React basics: JSX, Components, Props, State',
      '3. Dive into Hooks: useState, useEffect, useContext, useReducer',
      '4. Study React Router for navigation',
      '5. Practice with projects: Todo App → E-commerce Frontend',
      '6. Resources: Official React Docs, Scrimba React Course, Full Stack Open'
    ],
    estimatedTime: '4–6 weeks'
  },
  nodejs: {
    title: 'Node.js / Express',
    steps: [
      '1. Understand Node.js runtime, event loop, and async/await',
      '2. Build REST APIs with Express.js',
      '3. Study middleware, routing, and error handling',
      '4. Connect to databases (MySQL/MongoDB) with ORMs',
      '5. Learn authentication: JWT, bcrypt, sessions',
      '6. Resources: Node.js docs, The Odin Project, Traversy Media YouTube'
    ],
    estimatedTime: '4–6 weeks'
  },
  'node.js': {
    title: 'Node.js / Express',
    steps: [
      '1. Understand Node.js runtime, event loop, and async/await',
      '2. Build REST APIs with Express.js',
      '3. Study middleware, routing, and error handling',
      '4. Connect to databases (MySQL/MongoDB) with ORMs',
      '5. Learn authentication: JWT, bcrypt, sessions',
      '6. Resources: Node.js docs, The Odin Project, Traversy Media YouTube'
    ],
    estimatedTime: '4–6 weeks'
  },
  sql: {
    title: 'SQL / Databases',
    steps: [
      '1. Learn SQL basics: SELECT, INSERT, UPDATE, DELETE',
      '2. Understand JOIN types, GROUP BY, subqueries',
      '3. Study database normalization (1NF, 2NF, 3NF)',
      '4. Practice indexing, transactions, and stored procedures',
      '5. Work with MySQL Workbench or DBeaver for hands-on practice',
      '6. Resources: SQLZoo, Mode Analytics SQL Tutorial, LeetCode Database section'
    ],
    estimatedTime: '2–4 weeks'
  },
  mysql: {
    title: 'MySQL',
    steps: [
      '1. Learn SQL basics: SELECT, INSERT, UPDATE, DELETE',
      '2. Practice complex JOINs and subqueries',
      '3. Study indexing and query optimization',
      '4. Learn stored procedures, triggers, and views',
      '6. Resources: MySQL Documentation, W3Schools SQL, LeetCode Database'
    ],
    estimatedTime: '2–3 weeks'
  },
  java: {
    title: 'Java',
    steps: [
      '1. Study Java syntax: variables, control flow, OOP',
      '2. Learn Collections framework: Lists, Maps, Sets',
      '3. Understand multithreading and concurrency',
      '4. Practice exception handling and I/O',
      '5. Learn Spring Boot for backend development',
      '6. Resources: Java Brains YouTube, Effective Java book, LeetCode (Java)'
    ],
    estimatedTime: '6–8 weeks'
  },
  python: {
    title: 'Python',
    steps: [
      '1. Learn Python syntax, data types, and control flow',
      '2. Study functions, modules, and OOP in Python',
      '3. Work with libraries: NumPy, Pandas for data manipulation',
      '4. Build scripts and automate tasks',
      '5. Resources: Automate the Boring Stuff (free), Python.org Tutorial, Corey Schafer YouTube'
    ],
    estimatedTime: '3–5 weeks'
  },
  'data structures': {
    title: 'Data Structures & Algorithms',
    steps: [
      '1. Learn Arrays, Strings, and Hashing',
      '2. Study Linked Lists, Stacks, and Queues',
      '3. Master Trees (BST, AVL) and Graphs',
      '4. Practice Sorting algorithms and Binary Search',
      '5. Solve 100+ LeetCode problems (Easy → Medium → Hard)',
      '6. Resources: NeetCode.io roadmap, Striver A2Z Sheet, Abdul Bari (YouTube)'
    ],
    estimatedTime: '8–12 weeks'
  },
  'system design': {
    title: 'System Design',
    steps: [
      '1. Understand scalability: horizontal vs vertical scaling',
      '2. Study Load Balancers, CDN, Caching (Redis)',
      '3. Learn database sharding and replication',
      '4. Practice designing real systems: URL Shortener, Twitter, Netflix',
      '5. Resources: System Design Primer (GitHub), Grokking System Design, Alex Xu book'
    ],
    estimatedTime: '6–10 weeks'
  },
  'machine learning': {
    title: 'Machine Learning',
    steps: [
      '1. Brush up on Linear Algebra, Statistics, and Probability',
      '2. Learn ML fundamentals: Regression, Classification, Clustering',
      '3. Practice with Scikit-Learn and Pandas',
      '4. Explore Neural Networks and Deep Learning with TensorFlow/PyTorch',
      '5. Work on Kaggle competitions for real-world experience',
      '6. Resources: Andrew Ng ML Course, fast.ai, Kaggle Micro-Courses'
    ],
    estimatedTime: '10–16 weeks'
  },
  aws: {
    title: 'AWS / Cloud Computing',
    steps: [
      '1. Understand Cloud concepts: IaaS, PaaS, SaaS',
      '2. Learn core AWS services: EC2, S3, Lambda, RDS',
      '3. Practice deploying applications to EC2 and using S3 for storage',
      '4. Study IAM roles, security groups, and VPC',
      '5. Resources: AWS Free Tier, A Cloud Guru, Stephane Maarek courses on Udemy'
    ],
    estimatedTime: '4–6 weeks'
  },
  docker: {
    title: 'Docker & Containerization',
    steps: [
      '1. Understand what containerization is and why it matters',
      '2. Learn Docker CLI: build, run, push, pull commands',
      '3. Write Dockerfiles and docker-compose.yml files',
      '4. Learn Docker networking and volumes',
      '5. Resources: Docker Official Docs, TechWorld with Nana YouTube'
    ],
    estimatedTime: '2–3 weeks'
  },
  javascript: {
    title: 'JavaScript',
    steps: [
      '1. Master JS fundamentals: variables, functions, loops',
      '2. Study the DOM and event handling',
      '3. Learn async patterns: callbacks, Promises, async/await',
      '4. Understand ES6+ features: arrow functions, spread, destructuring',
      '5. Practice fetch API and AJAX',
      '6. Resources: javascript.info (free), Eloquent JavaScript (free), freeCodeCamp'
    ],
    estimatedTime: '4–6 weeks'
  },
  default: {
    title: 'General Programming',
    steps: [
      '1. Choose a language (Python/Java/JavaScript) and master the basics',
      '2. Practice Data Structures & Algorithms on LeetCode or HackerRank',
      '3. Build 2–3 portfolio projects showcasing this skill',
      '4. Follow the company\'s tech stack in open-source projects',
      '5. Resources: The Odin Project, freeCodeCamp, CS50 Harvard (free)'
    ],
    estimatedTime: '4–8 weeks'
  }
};

function getLearningPath(skillName) {
  const key = skillName.toLowerCase().trim();
  return LEARNING_PATHS[key] || { ...LEARNING_PATHS['default'], title: skillName };
}

// ─────────────────────────────────────────────
// Core Eligibility Logic Engine
// ─────────────────────────────────────────────
function runEligibilityCheck(studentData, company) {
  const { cgpa, branch, skills, backlogs, graduation_year } = studentData;

  const missingCriteria = [];
  const missingSkills = [];
  let hardFail = false;

  // 1. CGPA Check
  if (company.min_cgpa && parseFloat(cgpa) < parseFloat(company.min_cgpa)) {
    missingCriteria.push({
      field: 'CGPA',
      required: `${company.min_cgpa} or above`,
      provided: `${cgpa}`,
      message: `Your CGPA (${cgpa}) is below the minimum requirement of ${company.min_cgpa}.`
    });
    hardFail = true;
  }

  // 2. Backlogs Check
  const maxAllowedBacklogs = company.max_backlogs ?? 0;
  if (parseInt(backlogs) > maxAllowedBacklogs) {
    missingCriteria.push({
      field: 'Backlogs',
      required: `${maxAllowedBacklogs} backlogs allowed`,
      provided: `${backlogs} active backlogs`,
      message: `You have ${backlogs} active backlog(s). This company allows a maximum of ${maxAllowedBacklogs}.`
    });
    hardFail = true;
  }

  // 3. Branch Check
  const allowedBranches = company.allowed_branches || [];
  if (allowedBranches.length > 0) {
    const branchMatch = allowedBranches.some(
      b => b.toLowerCase().replace(/\s/g, '') === branch.toLowerCase().replace(/\s/g, '')
    );
    if (!branchMatch) {
      missingCriteria.push({
        field: 'Branch',
        required: allowedBranches.join(', '),
        provided: branch,
        message: `Your branch (${branch}) is not in the list of allowed branches: ${allowedBranches.join(', ')}.`
      });
      hardFail = true;
    }
  }

  // 5. Skills Check
  const requiredSkills = company.required_skills || [];
  const studentSkillsRaw = Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim().toLowerCase());

  if (requiredSkills.length > 0) {
    for (const reqSkill of requiredSkills) {
      const matched = studentSkillsRaw.some(
        s => s.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(s)
      );
      if (!matched) {
        missingSkills.push(reqSkill);
      }
    }
  }

  // ── Determine final Status ──
  let status;
  if (hardFail) {
    status = 'Not Eligible';
  } else if (missingSkills.length > 0) {
    status = 'Partially Eligible';
  } else {
    status = 'Eligible';
  }

  // ── Generate Learning Path Recommendation ──
  let recommendation = '';
  if (missingSkills.length > 0) {
    recommendation = `To become fully eligible, focus on the following skills:\n\n`;
    missingSkills.forEach(skill => {
      const path = getLearningPath(skill);
      recommendation += `📘 **${path.title}** (Est. time: ${path.estimatedTime})\n`;
      path.steps.forEach(step => { recommendation += `  ${step}\n`; });
      recommendation += '\n';
    });
  }

  if (status === 'Eligible') {
    recommendation = 'Great news! You meet all the criteria. Start preparing for the interview rounds. Focus on practising previous year questions and mock interviews. All the best! 🎉';
  } else if (status === 'Not Eligible' && missingSkills.length > 0) {
    recommendation += '\nAdditionally, address the criteria gaps listed above. Consider improving your CGPA, clearing backlogs, or waiting for the next eligible batch.';
  } else if (status === 'Not Eligible') {
    recommendation = 'Unfortunately, you do not meet the hard eligibility criteria (CGPA, Branch, Backlogs, or Graduation Year). Focus on addressing these gaps. Many companies run off-campus drives — keep improving!';
  }

  return { status, missingCriteria, missingSkills, recommendation };
}

// ─────────────────────────────────────────────
// Controller Exports
// ─────────────────────────────────────────────
exports.checkEligibility = async (req, res) => {
  try {
    const { company_id, cgpa, branch, skills, backlogs } = req.body;

    if (!company_id || !cgpa || !branch) {
      return res.status(400).json({ message: 'company_id, cgpa, and branch are required.' });
    }

    const company = await Company.findById(company_id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    // Parse JSON fields from DB if they are strings
    if (typeof company.required_skills === 'string') company.required_skills = JSON.parse(company.required_skills);
    if (typeof company.allowed_branches === 'string') company.allowed_branches = JSON.parse(company.allowed_branches);
    if (typeof company.allowed_graduation_years === 'string') company.allowed_graduation_years = JSON.parse(company.allowed_graduation_years);

    const studentData = { cgpa, branch, skills, backlogs: backlogs ?? 0 };
    const result = runEligibilityCheck(studentData, company);

    // Save the check to DB
    const studentId = req.user?.id || null;
    const [dbResult] = await pool.execute(
      `INSERT INTO eligibility_checks
   (student_id, company_id, cgpa, branch, skills, backlogs, status, missing_criteria, missing_skills, recommendation)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        company_id,
        cgpa,
        branch,
        JSON.stringify(Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim())),
        backlogs ?? 0,
        result.status,
        JSON.stringify(result.missingCriteria),
        JSON.stringify(result.missingSkills),
        result.recommendation
      ]
    );
    res.json({
      checkId: dbResult.insertId,
      company: { id: company.id, name: company.company_name, role: company.job_role },
      student: studentData,
      ...result
    });
  } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("STACK:", error.stack);

    res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }

};

exports.getMyHistory = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ec.*, c.company_name, c.job_role, c.logo_url
       FROM eligibility_checks ec
       JOIN companies c ON ec.company_id = c.id
       WHERE ec.student_id = ?
       ORDER BY ec.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("STACK:", error.stack);

    res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }

};
