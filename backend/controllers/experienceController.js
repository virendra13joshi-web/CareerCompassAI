const Experience = require('../models/Experience');
const { notifyAllStudents } = require('../services/notificationService');

exports.getExperiences = async (req, res) => {
  try {
    const search = req.query.search || '';
    const difficulty = req.query.difficulty || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const currentStudentId = req.user?.id || null;

    const result = await Experience.findAll({ search, difficulty, page, limit, currentStudentId });
    res.json(result);
  } catch (error) {
    console.error('getExperiences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExperienceById = async (req, res) => {
  try {
    const currentStudentId = req.user?.id || null;
    const experience = await Experience.findById(req.params.id, currentStudentId);
    if (!experience) {
      return res.status(404).json({ message: 'Interview experience not found' });
    }
    const comments = await Experience.getComments(req.params.id);
    res.json({ ...experience, comments });
  } catch (error) {
    console.error('getExperienceById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createExperience = async (req, res) => {
  try {
    const {
      company_name, role, interview_date, difficulty_level,
      technical_questions, hr_questions, coding_questions, tips
    } = req.body;

    if (!company_name || !role) {
      return res.status(400).json({ message: 'Company Name and Role are required fields.' });
    }

    const id = await Experience.create({
      student_id: req.user.id,
      company_name,
      role,
      interview_date,
      difficulty_level,
      technical_questions,
      hr_questions,
      coding_questions,
      tips
    });

    // Notify all students about the new experience
    notifyAllStudents(
      'new_experience',
      `💬 New Interview Experience: ${company_name}`,
      `A student just shared their interview experience for **${company_name}** (${role}). Difficulty: ${difficulty_level || 'Medium'}. Check it out for tips and insights!`
    );

    res.status(201).json({ message: 'Interview experience submitted successfully!', id });
  } catch (error) {
    console.error('createExperience error:', error);
    res.status(500).json({ message: 'Server error while submitting experience' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const isLiked = await Experience.toggleLike(req.user.id, req.params.id);
    res.json({ is_liked: isLiked, message: isLiked ? 'Liked' : 'Unliked' });
  } catch (error) {
    console.error('toggleLike error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    const commentId = await Experience.addComment(req.user.id, req.params.id, comment.trim());
    res.status(201).json({ message: 'Comment added successfully', id: commentId });
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
