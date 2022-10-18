const express = require('express');
const {register, login, getMe} = require('../controllers/authController');
const {protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/Me', protect, getMe);

module.exports = router;