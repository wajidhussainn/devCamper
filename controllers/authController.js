const path = require('path');
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandlerMiddleware");

// @desc     Register User
// @route    POST /api/v1/auth/register
// @access   Public

exports.register = asyncHandler(async (req, res, next)=>{
    const {name, email, password, role} = req.body;

    // Create User
    const user = await User.create({
        name,
        email,
        password,
        role
     })

    // //  Create Token
    // const token = user.getSignedJwtToken()

    // res.status(200).json({
    //     success: true,
    //     token
    // })
    // instead of creating token in login and register we created a function for it and now calling that function
    sendTokenResponse(user, 200, res)
})


// @desc     Login User
// @route    POST /api/v1/auth/login
// @access   Public

exports.login = asyncHandler(async (req, res, next)=>{
    const {email, password} = req.body;

    // Validate email and password
    if(!email || !password){
        return next(new ErrorResponse('Please provide an email and password', 400))
    }
    
    // check for user
    const user = await User.findOne({email}).select('+password'); //password is not included by default
    
    if(!user){
        return next(new ErrorResponse('Invalid Credentials', 401))
    }
    
    // check if password matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next(new ErrorResponse('Invalid Credentials', 401))
    }
    
    // //  Create Token
    // const token = user.getSignedJwtToken()
    
    // res.status(200).json({
        //     success: true,
        //     token
        // })
    // instead of creating token in login and register we created a function for it and now calling that function
    sendTokenResponse(user, 200, res)
})

// Get token from model, create cookie and send response
// creating this because we are creating tokens in both login and register
const sendTokenResponse = (user, statusCode, res)=>{
    // create token
    const token = user.getSignedJwtToken();

    // creating our cookie
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE *24*60*60*1000), //set for 3days
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    // res.cookie() takes 3 parameters 1st is key 2nd is value 3rd is options
    res.status(statusCode).cookie('token', token, options).json({success: true, token})
    console.log(options.expires)
}


// @desc     Get current loggedIn user
// @route    GET /api/v1/auth/me
// @access   Private

exports.getMe = asyncHandler(async(req, res, next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
})
