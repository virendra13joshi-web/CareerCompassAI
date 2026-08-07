const mysql = require('mysql2/promise');
require('dotenv').config();

let poolConfig;
if (process.env.DATABASE_URL) {
  poolConfig = process.env.DATABASE_URL;
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'careercompass',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

const pool = mysql.createPool(poolConfig);

// Initialize database schema
const initializeDatabase = async () => {
  try {
    // Create DB if not exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'careercompass'}\`;`);
    await connection.end();

    console.log('Database ensured.');

    const createStudentsTable = `
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        phone_number VARCHAR(20),
        college VARCHAR(255),
        branch VARCHAR(100),
        semester INT,
        cgpa DECIMAL(4,2),
        skills TEXT,
        linkedin VARCHAR(255),
        github VARCHAR(255),
        resume_url VARCHAR(255),
        profile_picture_url VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires DATETIME,
        google_id VARCHAR(255),
        role ENUM('student', 'admin') DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await pool.query(createStudentsTable);

    // Add columns to existing students table if they don't exist
    const newStudentCols = [
      "ALTER TABLE students ADD COLUMN role ENUM('student', 'admin') DEFAULT 'student'",
      "ALTER TABLE students ADD COLUMN google_id VARCHAR(255)",
      "ALTER TABLE students ADD COLUMN is_verified BOOLEAN DEFAULT FALSE",
      "ALTER TABLE students ADD COLUMN verification_token VARCHAR(255)",
      "ALTER TABLE students ADD COLUMN reset_password_token VARCHAR(255)",
      "ALTER TABLE students ADD COLUMN reset_password_expires DATETIME"
    ];
    for (const sql of newStudentCols) {
      try { await pool.query(sql); } catch (e) { /* already exists */ }
    }

    console.log('Students table ensured.');

    const createCompaniesTable = `
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(255),
        job_role VARCHAR(255) NOT NULL,
        package VARCHAR(100),
        location VARCHAR(255),
        min_cgpa DECIMAL(4,2),
        allowed_branches JSON,
        required_skills JSON,
        hiring_process TEXT,
        interview_rounds INT,
        previous_questions TEXT,
        application_deadline DATETIME,
        official_website VARCHAR(255),
        max_backlogs INT DEFAULT 0,
        allowed_graduation_years JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createCompaniesTable);

    // Add new columns to existing companies table if not present
    const newCompanyCols = [
      "ALTER TABLE companies ADD COLUMN max_backlogs INT DEFAULT 0",
      "ALTER TABLE companies ADD COLUMN allowed_graduation_years JSON"
    ];
    for (const sql of newCompanyCols) {
      try { await pool.query(sql); } catch (e) { /* already exists */ }
    }
    console.log('Companies table ensured.');

    const createBookmarksTable = `
      CREATE TABLE IF NOT EXISTS student_bookmarks (
        student_id INT,
        company_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (student_id, company_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createBookmarksTable);

    const createApplicationsTable = `
      CREATE TABLE IF NOT EXISTS student_applications (
        student_id INT,
        company_id INT,
        status ENUM('Applied', 'Interviewing', 'Offered', 'Rejected') DEFAULT 'Applied',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (student_id, company_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createApplicationsTable);

    const createEligibilityChecksTable = `
      CREATE TABLE IF NOT EXISTS eligibility_checks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        company_id INT NOT NULL,
        cgpa DECIMAL(4,2),
        branch VARCHAR(100),
        skills JSON,
        backlogs INT DEFAULT 0,
        graduation_year INT,
        status ENUM('Eligible', 'Partially Eligible', 'Not Eligible') NOT NULL,
        missing_criteria JSON,
        missing_skills JSON,
        recommendation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createEligibilityChecksTable);
    console.log('Bookmarks, Applications, and Eligibility Checks tables ensured.');

    const createResumeReportsTable = `
      CREATE TABLE IF NOT EXISTS resume_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        resume_filename VARCHAR(255),
        resume_url VARCHAR(255),
        raw_text LONGTEXT,
        ats_score INT,
        summary TEXT,
        strengths JSON,
        weaknesses JSON,
        missing_keywords JSON,
        formatting_issues JSON,
        suggestions JSON,
        section_scores JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
      )
    `;
    await pool.query(createResumeReportsTable);
    console.log('Resume reports table ensured.');

    const createChatConversationsTable = `
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        title VARCHAR(255) DEFAULT 'New Conversation',
        topic ENUM('general','hr','technical','dsa','sql','dbms','oop','resume','career','company') DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createChatConversationsTable);

    const createChatMessagesTable = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        role ENUM('user','assistant') NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createChatMessagesTable);
    console.log('Chat conversations and messages tables ensured.');

    const createInterviewExperiencesTable = `
      CREATE TABLE IF NOT EXISTS interview_experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        company_name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        interview_date DATE,
        difficulty_level ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
        technical_questions TEXT,
        hr_questions TEXT,
        coding_questions TEXT,
        tips TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
      )
    `;
    await pool.query(createInterviewExperiencesTable);

    const createExperienceLikesTable = `
      CREATE TABLE IF NOT EXISTS experience_likes (
        student_id INT,
        experience_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (student_id, experience_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (experience_id) REFERENCES interview_experiences(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createExperienceLikesTable);

    const createExperienceCommentsTable = `
      CREATE TABLE IF NOT EXISTS experience_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        experience_id INT NOT NULL,
        student_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES interview_experiences(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createExperienceCommentsTable);
    console.log('Interview experiences, likes, and comments tables ensured.');

    const createRoadmapsTable = `
      CREATE TABLE IF NOT EXISTS roadmaps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        dream_company VARCHAR(255) NOT NULL,
        current_skills JSON,
        target_date DATE,
        roadmap_data LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createRoadmapsTable);

    const createRoadmapProgressTable = `
      CREATE TABLE IF NOT EXISTS roadmap_progress (
        roadmap_id INT NOT NULL,
        student_id INT NOT NULL,
        task_id VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (roadmap_id, task_id),
        FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createRoadmapProgressTable);
    console.log('Roadmaps and progress tracking tables ensured.');

    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NULL,
        type ENUM('new_company','deadline_near','resume_done','new_experience','roadmap_updated','general') DEFAULT 'general',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createNotificationsTable);
    console.log('Notifications table ensured.');

    // Create Indexes for Performance
    const indexQueries = [
      "CREATE INDEX IF NOT EXISTS idx_student_email ON students(email)",
      "CREATE INDEX IF NOT EXISTS idx_bookmarks_student ON student_bookmarks(student_id)",
      "CREATE INDEX IF NOT EXISTS idx_experiences_company ON interview_experiences(company_name)",
      "CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id)"
    ];

    for (const query of indexQueries) {
      try {
        await pool.query(query);
      } catch (e) {
        // Ignore errors if indexes already exist but IF NOT EXISTS isn't supported in this MySQL version
      }
    }
    console.log('Database indexes ensured.');

  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  pool,
  initializeDatabase
};
