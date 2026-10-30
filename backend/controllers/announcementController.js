const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public / Authenticated
const getAnnouncements = async (req, res) => {
  try {
    const { category, department } = req.query;
    let query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (department && department !== 'All') {
      query.$or = [{ targetDepartment: 'All' }, { targetDepartment: department }];
    }

    const announcements = await Announcement.find(query)
      .populate('postedBy', 'name designation role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create announcement (HR)
// @route   POST /api/announcements
// @access  HR
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority, targetDepartment } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      targetDepartment: targetDepartment || 'All',
      postedBy: req.user._id,
    });

    // Create notifications for users
    let userFilter = { isActive: true, _id: { $ne: req.user._id } };
    if (targetDepartment && targetDepartment !== 'All') {
      userFilter.department = targetDepartment;
    }
    const recipients = await User.find(userFilter).select('_id');

    if (recipients.length > 0) {
      const notificationDocs = recipients.map((u) => ({
        recipient: u._id,
        sender: req.user._id,
        title: `Announcement: ${title}`,
        message: content.length > 100 ? `${content.substring(0, 97)}...` : content,
        type: 'announcement',
        link: '/announcements',
      }));
      await Notification.insertMany(notificationDocs);
    }

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  HR
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await announcement.deleteOne();
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
