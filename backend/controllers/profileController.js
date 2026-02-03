const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId }).lean();
    res.json({ profile: profile || null });
  } catch (err) {
    console.error('Get profile failed', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const { name, email, bio, avatarUrl } = req.body;
    const existing = await Profile.findOne({ userId: req.userId });
    if (existing) {
      return res.status(409).json({ error: 'Profile already exists. Use update instead.' });
    }
    const profile = await Profile.create({ userId: req.userId, name, email, bio, avatarUrl });
    res.status(201).json({ profile });
  } catch (err) {
    console.error('Create profile failed', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio, avatarUrl } = req.body;
    const next = {};
    if (name !== undefined) next.name = name;
    if (email !== undefined) next.email = email;
    if (bio !== undefined) next.bio = bio;
    if (avatarUrl !== undefined) next.avatarUrl = avatarUrl;
    const updated = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $set: next },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Profile not found. Create one first.' });
    }
    res.json({ profile: updated });
  } catch (err) {
    console.error('Update profile failed', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await Profile.deleteMany({ userId: req.userId });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete profile failed', err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};
