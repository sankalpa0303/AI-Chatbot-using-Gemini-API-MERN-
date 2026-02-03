const express = require('express');
const { getProfile, createOrUpdateProfile, deleteProfile } = require('../controllers/profileController');

const router = express.Router();

router.get('/', getProfile);
router.post('/', createOrUpdateProfile);
router.put('/:id', createOrUpdateProfile); // id ignored for single-profile pattern
router.delete('/', deleteProfile);

module.exports = router;
