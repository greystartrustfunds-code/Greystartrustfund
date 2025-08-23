import express from 'express';
import { body } from 'express-validator';
import { submitMessage, getAllMessages, addReplyToMessage } from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js'; // Assuming protect middleware is available

const router = express.Router();

// Public route for users to submit contact messages
router.post(
  '/',
  [
    body('senderName').notEmpty().withMessage('Sender name is required'),
    body('senderEmail').isEmail().withMessage('Valid sender email is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message content is required'),
  ],
  submitMessage
);

// Admin-only route to get all contact messages
router.get('/admin/contact-messages', protect, getAllMessages);

// Admin-only route to add a reply to a contact message
router.post(
  '/admin/contact-messages/:id/reply',
  protect,
  [
    body('replyMessage').notEmpty().withMessage('Reply message cannot be empty'),
  ],
  addReplyToMessage
);

export default router;
