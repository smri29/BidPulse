// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/register.js
// Purpose: register
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const { validateTurnstileToken } = require('../../../utils/turnstile');

const register = async (req, res) => {
  const { name, email, password, turnstileToken } = req.body;

  try {
    const remoteip =
      req.headers['cf-connecting-ip'] ||
      String(req.headers['x-forwarded-for'] || '')
        .split(',')
        .map((item) => item.trim())
        .find(Boolean) ||
      req.ip;

    const turnstileValidation = await validateTurnstileToken({
      token: turnstileToken || req.body['cf-turnstile-response'],
      remoteip,
    });

    if (!turnstileValidation.success) {
      return res
        .status(turnstileValidation.status)
        .json({ message: turnstileValidation.message, errorCodes: turnstileValidation.errorCodes });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      emailVerified: false,
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    return res.status(201).json({
      message: 'Account created successfully. Please sign in to continue.',
      accountCreated: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = register;


