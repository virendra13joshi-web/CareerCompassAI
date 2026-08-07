const OpenAI = require('openai');
const { pool } = require('../config/db');

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Topic System Prompts ─────────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  general: `You are CareerCompass AI, an expert career assistant helping college students in India with campus placements. You provide clear, actionable, and encouraging guidance. You answer questions about career planning, interview preparation, technical skills, and placement strategies. Format your responses with clear headings, bullet points, and code examples where relevant. Be friendly, precise, and motivating.`,

  hr: `You are an expert HR interview coach with 15+ years of experience at top tech companies (Google, Amazon, Microsoft, TCS, Infosys). You specialize in coaching students for HR and behavioral interviews. You:
- Ask follow-up questions to help students practice
- Explain the STAR method (Situation, Task, Action, Result)
- Give sample strong and weak answers for comparison
- Provide feedback on student answers
- Cover topics: self-introduction, strengths/weaknesses, teamwork, leadership, conflict resolution, future goals
- Always provide 2-3 sample answers for each question you discuss
Be warm, constructive, and specific in your feedback.`,

  technical: `You are a senior software engineer and technical interview coach with experience at FAANG companies. You help students prepare for technical interviews covering:
- Programming concepts (OOP, OS, Networks, DBMS)
- System design fundamentals
- Code optimization techniques
- Language-specific questions (Java, Python, C++, JavaScript)
- Framework questions (React, Node.js, Spring)
When explaining concepts, always provide code examples. Use clear explanations followed by example interview questions and model answers.`,

  dsa: `You are a DSA (Data Structures & Algorithms) expert and competitive programmer who has mentored thousands of students to crack top tech company interviews. You specialise in:
- Array, String, Linked List, Tree, Graph, DP, Backtracking, Greedy, Divide & Conquer
- Time & Space Complexity analysis (Big O)
- LeetCode-style problem walkthroughs
- Step-by-step approach: Brute Force → Optimised → Code
- Interview patterns: Sliding Window, Two Pointers, BFS/DFS, Union-Find
Always write clean, well-commented code. For every problem: (1) Understand, (2) Example, (3) Approach, (4) Code, (5) Complexity. Use Python/Java/C++ based on student preference.`,

  sql: `You are a database expert and SQL interview coach. You help students master:
- SQL basics: SELECT, WHERE, GROUP BY, HAVING, ORDER BY
- JOINs: INNER, LEFT, RIGHT, FULL OUTER, SELF, CROSS
- Subqueries, CTEs (WITH clause), Window Functions (RANK, ROW_NUMBER, LAG, LEAD)
- Query optimization, EXPLAIN plans, indexing strategies
- Classic SQL interview problems (employee salary, Nth highest, duplicates, etc.)
Always write clean SQL with comments. Explain WHY a query works, not just how. Provide alternative solutions when they exist. LeetCode-style SQL problem walkthroughs are your speciality.`,

  dbms: `You are a DBMS (Database Management Systems) professor and interview preparation expert. You cover:
- ACID properties (Atomicity, Consistency, Isolation, Durability)
- Normalization (1NF, 2NF, 3NF, BCNF) with examples
- Transactions, Concurrency Control, Deadlocks
- Indexing: B-Tree, Hash indexes; Clustered vs Non-clustered
- ER Diagrams, Relational Model, Keys (Primary, Foreign, Candidate, Super)
- NoSQL vs SQL, CAP theorem, eventual consistency
- Query processing and optimization
Explain concepts with diagrams (in text/ASCII art), real-world analogies, and expected interview answers.`,

  oop: `You are an Object-Oriented Programming expert who interviews candidates for top software companies. You specialise in:
- Four Pillars: Encapsulation, Abstraction, Inheritance, Polymorphism
- SOLID Principles with real-world examples
- Design Patterns: Singleton, Factory, Observer, Strategy, Decorator, etc.
- Abstract classes vs Interfaces
- Method Overloading vs Overriding
- Composition vs Inheritance
- Real coding examples in Java, Python, or C++ (student's choice)
For every concept: definition → real-world analogy → code example → common interview question → model answer.`,

  resume: `You are a professional resume writer and ATS expert who has reviewed 10,000+ resumes for tech companies. You help students:
- Write powerful bullet points using the XYZ formula (Accomplished X by doing Y resulting in Z)
- Optimize for ATS (keywords, formatting, structure)
- Craft compelling professional summaries
- Structure experience, projects, and education sections
- Improve project descriptions to highlight impact
- Tailor resumes for specific job descriptions
- Review and rewrite specific resume sections when provided
Be specific. When a student shares their bullet point, rewrite it to be better and explain why.`,

  career: `You are a senior career counselor specializing in helping Indian engineering students land placements at top tech companies. You provide:
- Personalized career roadmaps based on student background and goals
- Skill gap analysis for specific roles (Frontend, Backend, Data Science, DevOps, etc.)
- Study plans with weekly breakdowns and resources
- Salary negotiation advice
- Off-campus vs on-campus strategies
- Portfolio building guidance (GitHub, LinkedIn, open source)
- Company tier analysis and realistic goal setting
Ask clarifying questions to understand the student's current state before giving recommendations.`,

  company: `You are a placement expert with insider knowledge about campus recruitment processes at top tech companies. You provide:
- Company-specific interview rounds and formats
- Frequently asked questions (both technical and HR) per company
- Company culture, values, and what they look for
- Compensation packages and negotiation tips
- Preparation timelines for specific companies
- Employee reviews and work culture insights
Companies you cover: Google, Microsoft, Amazon, Meta, Apple, TCS, Infosys, Wipro, Cognizant, Accenture, Deloitte, Goldman Sachs, JP Morgan, Adobe, Salesforce, Oracle, and more.
When a student mentions a company, immediately provide targeted, actionable preparation advice.`
};

// ─── Mock Responses (when no API key) ────────────────────────────────────────
const MOCK_RESPONSES = {
  hr: `**Great question! Here's a classic HR interview answer framework:**

**Q: Tell me about yourself.**

**Strong Answer (STAR format):**
"I'm a final year CSE student at [University]. Over the past 3 years, I've built a strong foundation in full-stack development — I've worked on 4 major projects including a campus placement tracker built with React and Node.js. Last summer, I interned at [Company] where I improved API response times by 35%. I'm passionate about solving real-world problems with clean code, and I'm excited to bring this energy to your team."

**Key Tips:**
- Keep it under 2 minutes
- Mention: Education → Skills → Experience → Why this company
- Quantify achievements whenever possible

*Note: Add your OPENAI_API_KEY to .env for real AI responses!*`,

  dsa: `**Let's solve a classic DSA problem!**

**Problem: Two Sum** (LeetCode #1)
*Given an array of integers, return indices of two numbers that add up to target.*

**Approach:**
1. **Brute Force** — O(n²): Check every pair
2. **Optimal** — O(n): Use a HashMap

\`\`\`python
def twoSum(nums, target):
    seen = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Example:
# nums = [2, 7, 11, 15], target = 9
# Output: [0, 1]  (2 + 7 = 9)
\`\`\`

**Complexity:** Time O(n), Space O(n)

*Add your OPENAI_API_KEY to .env for full AI-powered DSA coaching!*`,

  sql: `**SQL Interview Question — Nth Highest Salary**

\`\`\`sql
-- Find the 2nd highest salary from Employee table
SELECT MAX(salary) AS SecondHighest
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);

-- Generic: Nth highest using LIMIT/OFFSET
SELECT DISTINCT salary
FROM Employee
ORDER BY salary DESC
LIMIT 1 OFFSET N-1;  -- Replace N with position

-- Using Window Function (modern approach):
SELECT salary
FROM (
  SELECT salary,
         DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM Employee
) ranked
WHERE rnk = 2;
\`\`\`

**Key concepts used:** Subquery, DISTINCT, LIMIT/OFFSET, Window Functions (DENSE_RANK)

*Add your OPENAI_API_KEY to .env for full AI SQL coaching!*`,

  general: `**👋 Welcome to CareerCompass AI Assistant!**

I'm here to help you ace your campus placements. Here's what I can help with:

| Topic | What I'll Cover |
|-------|----------------|
| 🎤 **HR** | Behavioral questions, STAR method, mock interviews |
| 💻 **DSA** | LeetCode problems, algorithms, complexity analysis |
| 🗄️ **SQL** | Query writing, joins, window functions |
| 🏗️ **DBMS** | ACID, normalization, transactions |
| 🧱 **OOP** | Pillars, SOLID, design patterns |
| 📄 **Resume** | ATS optimization, bullet rewrites |
| 🚀 **Career** | Roadmaps, skill gaps, study plans |
| 🏢 **Company** | Company-specific prep, interview formats |

**Try asking me:**
- "Give me 5 common Amazon HR questions"
- "Explain binary search with code"
- "Write SQL to find duplicate records"
- "Help me rewrite my resume bullet point"

*Add your OPENAI_API_KEY to .env for full AI-powered responses!*`
};

// ─── Helper: Auto-generate conversation title ─────────────────────────────────
function generateTitle(message, topic) {
  const topicLabel = topic.toUpperCase();
  const words = message.trim().split(' ').slice(0, 6).join(' ');
  return `${topicLabel}: ${words}${message.split(' ').length > 6 ? '...' : ''}`;
}

// ─── Controller: Send Message ─────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { conversation_id, message, topic = 'general' } = req.body;
    const studentId = req.user.id;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    let convId = conversation_id;

    // Create new conversation if none provided
    if (!convId) {
      const title = generateTitle(message, topic);
      const [convResult] = await pool.execute(
        `INSERT INTO chat_conversations (student_id, title, topic) VALUES (?, ?, ?)`,
        [studentId, title, topic]
      );
      convId = convResult.insertId;
    } else {
      // Verify ownership
      const [convRows] = await pool.execute(
        `SELECT id FROM chat_conversations WHERE id = ? AND student_id = ?`,
        [convId, studentId]
      );
      if (!convRows[0]) return res.status(403).json({ message: 'Conversation not found.' });
    }

    // Save user message
    await pool.execute(
      `INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, 'user', ?)`,
      [convId, message.trim()]
    );

    // Fetch last 15 messages for context
    const [history] = await pool.execute(
      `SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 15`,
      [convId]
    );
    const contextMessages = history.reverse().map(m => ({ role: m.role, content: m.content }));

    // Call OpenAI or use mock
    let assistantReply;
    const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

    if (hasApiKey) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS[topic] || SYSTEM_PROMPTS.general },
            ...contextMessages
          ],
          temperature: 0.7,
          max_tokens: 1500
        });
        assistantReply = completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
      } catch (aiErr) {
        console.error('OpenAI error:', aiErr.message);
        assistantReply = MOCK_RESPONSES[topic] || MOCK_RESPONSES.general;
      }
    } else {
      // Simulate a short delay for realism even in mock mode
      await new Promise(r => setTimeout(r, 800));
      assistantReply = MOCK_RESPONSES[topic] || MOCK_RESPONSES.general;
    }

    // Save assistant message
    await pool.execute(
      `INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, 'assistant', ?)`,
      [convId, assistantReply]
    );

    // Update conversation updated_at
    await pool.execute(`UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?`, [convId]);

    res.json({
      conversation_id: convId,
      message: assistantReply
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Chat service error. Please try again.' });
  }
};

// ─── Controller: Get All Conversations ────────────────────────────────────────
exports.getConversations = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.title, c.topic, c.created_at, c.updated_at,
              (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM chat_conversations c
       WHERE c.student_id = ?
       ORDER BY c.updated_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── Controller: Get Messages for a Conversation ──────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    // Verify ownership
    const [convRows] = await pool.execute(
      `SELECT id, title, topic FROM chat_conversations WHERE id = ? AND student_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!convRows[0]) return res.status(403).json({ message: 'Conversation not found.' });

    const [messages] = await pool.execute(
      `SELECT id, role, content, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json({ conversation: convRows[0], messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── Controller: Delete Conversation ─────────────────────────────────────────
exports.deleteConversation = async (req, res) => {
  try {
    const [convRows] = await pool.execute(
      `SELECT id FROM chat_conversations WHERE id = ? AND student_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!convRows[0]) return res.status(403).json({ message: 'Conversation not found.' });

    await pool.execute(`DELETE FROM chat_conversations WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Conversation deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
