const express = require('express');
const {getCourses, getCourse, addCourse, updateCourse, deleteCourse} = require('../controllers/coursesController');
const Course = require('../models/Course');
const advancedResultsMiddleware = require('../middlewares/advancedResultsMiddleware');
const {protect, authorize} = require('../middlewares/authMiddleware');

const router = express.Router({mergeParams: true});


router.route('/').get(advancedResultsMiddleware(Course, {
    path: 'bootcamp',
    select: 'name description'
}), getCourses).post(protect, authorize("publisher", "admin"), addCourse); //already re-routed in bootcamps so it will work
router.route('/:id').get(getCourse).put(protect, authorize("publisher", "admin"), updateCourse).delete(protect, authorize("publisher", "admin"), deleteCourse);

module.exports = router;