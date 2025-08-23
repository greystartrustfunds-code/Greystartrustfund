import { validationResult } from 'express-validator';
import ContactMessage from '../models/ContactMessage.js';
import User from '../models/User.js'; // Assuming User model is needed for admin details

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
const submitMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { senderName, senderEmail, subject, message } = req.body;

    const contactMessage = await ContactMessage.create({
      senderName,
      senderEmail,
      subject,
      message,
    });

    if (contactMessage) {
      res.status(201).json({ success: true, message: 'Message sent successfully', data: contactMessage });
    } else {
      res.status(400).json({ success: false, message: 'Invalid message data' });
    }
  } catch (error) {
    console.error('Submit message error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting message' });
  }
};

// @desc    Get all contact messages (for admin)
// @route   GET /api/admin/contact-messages
// @access  Private/Admin
const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
};

// @desc    Add a reply to a contact message (for admin)
// @route   POST /api/admin/contact-messages/:id/reply
// @access  Private/Admin
const addReplyToMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { id } = req.params;
    const { replyMessage } = req.body;

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Ensure the user making the reply is an admin
    if (req.user && req.user.role === 'admin') {
      const reply = {
        adminId: req.user._id,
        adminName: req.user.fullName, // Assuming fullName is available on req.user
        message: replyMessage,
      };

      message.replies.push(reply);
      message.status = 'replied'; // Update status when replied
      await message.save();

      res.status(201).json({ success: true, message: 'Reply added successfully', data: message });
    } else {
      res.status(403).json({ success: false, message: 'Not authorized as an admin to reply' });
    }
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ success: false, message: 'Server error adding reply' });
  }
};

export { submitMessage, getAllMessages, addReplyToMessage };
