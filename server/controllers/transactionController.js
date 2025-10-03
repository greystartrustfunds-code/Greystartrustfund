
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const sendEmail = require('../utils/email');

exports.createDeposit = async (req, res) => {
  try {
    const { userId, amount, method } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new transaction
    const transaction = new Transaction({
      user: userId,
      type: 'Deposit',
      amount,
      method,
    });

    await transaction.save();

    // Send email notification
    const message = `Dear ${user.username},\n\nYour deposit of $${amount} via ${method} has been received and is being processed.\n\nThank you for choosing Greystar Trust Fund.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Deposit Received',
        message,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // You might want to handle this error in a specific way
      // For now, we'll just log it and continue
    }

    res.status(201).json({ message: 'Deposit created successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
