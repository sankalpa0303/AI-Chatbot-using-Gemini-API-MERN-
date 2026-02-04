const express = require('express');
const { register, login, requestPasswordReset, confirmPasswordReset } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset/request', requestPasswordReset);
router.post('/reset/confirm', confirmPasswordReset);

module.exports = router;
