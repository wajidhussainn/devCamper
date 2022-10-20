const path = require('path');
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandlerMiddleware");
const geocoder = require("../utils/geocoder");

// @desc     Get All Bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootCamps = asyncHandler(async (req, res, next) => {
  // try {
  //   const bootcamps = await Bootcamp.find();
  //   res
  //     .status(200)
  //     .json({ success: true, count: bootcamps.length, data: bootcamps });
  // } catch (error) {
  //   // res.status(400).json({ success: false });
  //   // error will be handled by error middleware
  //   next(error);
  // }

  // * by using our asyncHandler we do not need try catches any more so our controllers will look like this
// {moved this block to midlleware so that we can use advanced queries with every resource
  // const bootcamps = await Bootcamp.find(); //for custom queries doing the following
  // let query;

  // // copy req.query
  // const reqQuery = { ...req.query };

  // // Fields to exclude
  // const removeFields = ["select", "sort", "page", "limit"];

  // // Loop over removeFields and delete them from reqQuery
  // removeFields.forEach((param) => delete reqQuery[param]);

  // // create query string
  // let queryStr = JSON.stringify(reqQuery);

  // // create operators ($gt, $lt, $in etc)
  // queryStr = queryStr.replace(
  //   /\b(gt|gte|lt|lte|in)\b/g,
  //   (match) => `$${match}`
  // );

  // // finding resources based on that query
  // query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  // // select fields
  // if (req.query.select) {
  //   const fields = req.query.select.split(",").join(" ");
  //   query = query.select(fields);
  // }

  // // sort
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(",").join(" ");
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort("-createdAt");
  // }

  // // pagination
  // const page = parseInt(req.query.page, 10) || 1;
  // const limit = parseInt(req.query.limit, 10) || 25;
  // const startIndex = (page - 1) * limit;
  // const endIndex = page * limit;
  // const total = await Bootcamp.countDocuments();
  // query = query.skip(startIndex).limit(limit);

  // // executing query
  // const bootcamps = await query;

  // // pagination result
  // const pagination = {};
  // if (endIndex < total) {
  //   pagination.next = {
  //     page: page + 1,
  //     limit,
  //   };
  // }
  // if (startIndex > 0) {
  //   pagination.prev = {
  //     page: page - 1,
  //     limit,
  //   };
  // }
  
  res
  .status(200)
  .json(res.advancedResults);
});

// @desc     Get Single Bootcamp
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootCamp = asyncHandler(async (req, res, next) => {
  // try {
  //   const bootcamp = await Bootcamp.findById(req.params.id);
  //   if (!bootcamp) {
  //     // return res.status(400).json({success: false}); //using errorResponse class
  //     return next(
  //       new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  //       );
  //     }
  //     res.status(200).json({ success: true, data: bootcamp });
  //   } catch (error) {
  //   // res.status(400).json({success: false})
  //   next(error); //now using response below
  //   // next(
  //   //   new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404) //added this to errormiddleware
  //   // );
  // }

  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc     Create new Bootcamp
// @route    POST /api/v1/bootcamps
// @access   Private
exports.createBootCamp = asyncHandler(async (req, res, next) => {
  // try {
  //   // console.log(req.body);
  //   const bootcamp = await Bootcamp.create(req.body);
  //   res.status(201).json({ success: true, data: bootcamp });
  // } catch (error) {
  //   // res.status(400).json({ success: false });
  //   // error will be handled by error middleware
  //   next(error);
  // }

  // add user to req.body
  req.body.user = req.user.id;

  // check for pyblished bootcamp
  const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});

  // if the user is not an admin, they can only add one bootcamp
  if(publishedBootcamp && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User with id ${req.user.id} has already published a bootcamp`, 400));
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc     Update Bootcamp
// @route    PUT /api/v1/bootcamps/:id
// @access   Private
exports.updateBootCamp = asyncHandler(async (req, res, next) => {
  // try {
  //   const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
  //     new: true,
  //     runValidators: true,
  //   });
  //   if (!bootcamp) {
  //     // return res.status(400).json({ success: false });
  //     return next(
  //       new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  //       );
  //   }
  //   res.status(200).json({ success: true, data: bootcamp });
  // } catch (error) {
  //   // res.status(400).json({ success: false });
  //   // error will be handled by error middleware
  //   next(error);
  // }
  // const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { //need to check the user so will do it like below
  //   new: true,
  //   runValidators: true,
  // });

  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }
    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(
      new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401)
    )
  }
   bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc     delete Bootcamp
// @route    DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
  // try {
  //   const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  //   if (!bootcamp) {
  //     // return res.status(400).json({ success: false });
  //     return next(
  //       new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  //       );
  //   }
  //   res.status(200).json({ success: true, data: {} });
  // } catch (error) {
  //   // res.status(400).json({ success: false });
  //   // error will be handled by error middleware
  //   next(error);
  // }

  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id); //this will not trigger the cascade delete middleware from bootcamp model so we will use findById and then remove()
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(
    new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401)
  )
}
  bootcamp.remove()
  res.status(200).json({ success: true, data: {} });
});

// @desc     Get Bootcamps within a radius
// @route    GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private
exports.getBootCampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // get latitude and longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const { latitude, longitude } = loc[0];


  // calculate radius using radians
  // divide distance by radius of the earth
  // earth's radius = 3,963 mi or 6378km

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });
 
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc     Upload photo for Bootcamp
// @route    PUT /api/v1/bootcamps/:id/photo
// @access   Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(
    new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401)
  )
}

  if(!req.files){
    return next(
      new ErrorResponse(`Please upload a file`, 400)
    )
  }
  const file = req.files.file;
  
  // Make sure the image is a photo
  if(!file.mimetype.startsWith('image')){
    return next(
      new ErrorResponse(`Please upload an image file`, 400)
    )
  }
  
  console.log(process.env.MAX_FILE_UPLOAD, file.size)
  // check file size
  if(file.size > process.env.MAX_FILE_UPLOAD){
    return next(
      new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
    )
  }

  // create custom filename
  // we need nodejs file module for taking out the extension of the file
  file.name =`photo_${bootcamp._id}${path.parse(file.name).ext}`
  console.log(file.name)

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=>{
    if(err){
      console.error(err)
      return next(
        new ErrorResponse(`Problem with file upload`, 500)
      )
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

    res.status(200).json({ success: true, data: file.name });
  })
});
