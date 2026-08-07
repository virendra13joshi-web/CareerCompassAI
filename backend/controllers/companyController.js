const Company = require('../models/Company');
const { notifyAllStudents } = require('../services/notificationService');

exports.getCompanies = async (req, res) => {
  try {
    const search = req.query.search || '';
    const location = req.query.location || '';
    const min_cgpa = req.query.min_cgpa ? parseFloat(req.query.min_cgpa) : null;
    const branch = req.query.branch || '';
    const sort_by = req.query.sort_by || 'created_at';
    const order = req.query.order || 'desc';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Company.findAll({ search, location, min_cgpa, branch, sort_by, order, page, limit });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Routes
exports.createCompany = async (req, res) => {
  try {
    const companyData = { ...req.body };
    if (req.files && req.files.logo) {
      companyData.logo_url = `/uploads/${req.files.logo[0].filename}`;
    }
    
    if (typeof companyData.allowed_branches === 'string') {
        companyData.allowed_branches = JSON.parse(companyData.allowed_branches);
    }
    if (typeof companyData.required_skills === 'string') {
        companyData.required_skills = JSON.parse(companyData.required_skills);
    }

    const id = await Company.create(companyData);

    // Notify all students about the new company
    notifyAllStudents(
      'new_company',
      `🏢 New Company Added: ${companyData.company_name}`,
      `${companyData.company_name} is now hiring for the role of **${companyData.role || 'Multiple Roles'}**. Package: ${companyData.package || 'Competitive'}. Check eligibility and apply before the deadline!`
    );

    res.status(201).json({ message: 'Company created successfully', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating company' });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const companyData = { ...req.body };
    if (req.files && req.files.logo) {
      companyData.logo_url = `/uploads/${req.files.logo[0].filename}`;
    }

    if (typeof companyData.allowed_branches === 'string') {
        companyData.allowed_branches = JSON.parse(companyData.allowed_branches);
    }
    if (typeof companyData.required_skills === 'string') {
        companyData.required_skills = JSON.parse(companyData.required_skills);
    }

    await Company.update(req.params.id, companyData);
    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    await Company.delete(req.params.id);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student Actions
exports.bookmarkCompany = async (req, res) => {
  try {
    await Company.bookmark(req.user.id, req.params.id);
    res.json({ message: 'Company bookmarked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    await Company.removeBookmark(req.user.id, req.params.id);
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Company.getBookmarks(req.user.id);
        res.json(bookmarks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.applyToCompany = async (req, res) => {
  try {
    // In a real app, you might check if student meets eligibility here
    await Company.apply(req.user.id, req.params.id);
    res.json({ message: 'Application submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
