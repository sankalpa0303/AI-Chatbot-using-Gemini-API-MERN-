const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeEmail = (email) => email?.toLowerCase().trim();

const signToken = (user) => {
  const secret = process.env.AUTH_SECRET || 'dev-secret';
  return jwt.sign({ userId: user._id, email: user.email }, secret, { expiresIn: '7d' });
};

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
