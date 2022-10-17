const express = require('express');
const {getBootCamps, getBootCamp, createBootCamp, updateBootCamp, deleteBootCamp, getBootCampsInRadius, bootcampPhotoUpload} = require('../controllers/bootCampsController')
// include other resource routers
const courseRouter = require('./courses');
const advancedResultsMiddleware = require('../middlewares/advancedResultsMiddleware')
const Bootcamp = require('../models/Bootcamp');

const router = express.Router();

// re-route other resource routers
router.use('/:bootcampId/courses', courseRouter);

// router.get('/', getBootCamps); 
// router.get('/:id', getBootCamp); 
// router.post('/', createBootCamp); 
// router.put('/:id', updateBootCamp); 
// router.delete('/:id', deleteBootCamp); 
router.route('/').get(advancedResultsMiddleware(Bootcamp, 'courses'), getBootCamps).post(createBootCamp); 
router.route('/:id').get(getBootCamp).put(updateBootCamp).delete(deleteBootCamp);  
router.route('/radius/:zipcode/:distance').get(getBootCampsInRadius);
router.route('/:id/photo').put(bootcampPhotoUpload);
  
module.exports = router;