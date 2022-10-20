const express = require('express');
const {getUsers, getUser, updateUser, deleteUser, createUser} = require('../controllers/usersController');
const User = require('../models/User');
const advancedResultsMiddleware = require('../middlewares/advancedResultsMiddleware');
const {protect, authorize} = require('../middlewares/authMiddleware');

const router = express.Router();

// we need protect and authorize middleware for every route so we can do this
router.use(protect);
router.use(authorize('admin'));

// we do not need populate so we will pass only User model to advancedResultsMiddleware
router.route('/').get(advancedResultsMiddleware(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;