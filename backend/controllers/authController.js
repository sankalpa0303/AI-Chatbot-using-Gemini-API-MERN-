const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const normalizeEmail = (email) => email?.toLowerCase().trim();

const signToken = (user) => {
  const secret = process.env.AUTH_SECRET || 'dev-secret';
  return jwt.sign({ userId: user._id, email: user.email }, secret, { expiresIn: '7d' });
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const normalized = normalizeEmail(email);
    const existing = await User.findOne({ email: normalized });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: normalized, passwordHash });
    const token = signToken(user);
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('Register failed', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const normalized = normalizeEmail(email);
    const user = await User.findOne({ email: normalized });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('Login failed', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalized = normalizeEmail(email);
    const user = await User.findOne({ email: normalized });

    if (!user) {
      return res.json({ message: 'If an account exists, a reset code has been created' });
    }

    const rawToken = crypto.randomBytes(20).toString('hex');
    user.resetTokenHash = hashToken(rawToken);
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    return res.json({
      message: 'Reset code generated. Use it within 30 minutes.',
      token: rawToken,
    });
  } catch (err) {
    console.error('Password reset request failed', err);
    return res.status(500).json({ error: 'Could not create reset request' });
  }
};

exports.confirmPasswordReset = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ error: 'Email, reset code, and new password are required' });
    }

    const normalized = normalizeEmail(email);
    const user = await User.findOne({ email: normalized });
    if (!user || !user.resetTokenHash || !user.resetTokenExpires) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    const expired = user.resetTokenExpires.getTime() < Date.now();
    const tokenMatches = user.resetTokenHash === hashToken(token);

    if (expired || !tokenMatches) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    const authToken = signToken(user);
    return res.json({
      message: 'Password updated',
      user: { id: user._id, name: user.name, email: user.email },
      token: authToken,
    });
  } catch (err) {
    console.error('Password reset confirm failed', err);
    return res.status(500).json({ error: 'Could not reset password' });
  }
};
