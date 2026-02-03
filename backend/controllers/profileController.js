const Profile = require('../models/Profile');

exports.getProfile = async (_req, res) => {
  try {
    const profile = await Profile.findOne().lean();
    res.json({ profile: profile || null });
  } catch (err) {
    console.error('Get profile failed', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { name, email, bio, avatarUrl } = req.body;
    const existing = await Profile.findOne();
    if (existing) {
      existing.name = name ?? existing.name;
      existing.email = email ?? existing.email;
      existing.bio = bio ?? existing.bio;
      existing.avatarUrl = avatarUrl ?? existing.avatarUrl;
      await existing.save();
      return res.json({ profile: existing });
    }
    const profile = await Profile.create({ name, email, bio, avatarUrl });
    res.status(201).json({ profile });
  } catch (err) {
    console.error('Save profile failed', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
};

exports.deleteProfile = async (_req, res) => {
  try {
    await Profile.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete profile failed', err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};
