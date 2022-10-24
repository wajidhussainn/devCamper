const crypto = require('crypto');
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
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


// @desc     Log User Out / clear cookie
// @route    GET /api/v1/auth/logout
// @access   Private

exports.logout = asyncHandler(async(req, res, next)=>{
    res.cookie('token', 'none', {
        expires: new Date(Date.now()+(10*1000)),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        data: {}
    })
})
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



// @desc     Update User details
// @route    UPDATE /api/v1/auth/updatedetails
// @access   Private
exports.updateDetails = asyncHandler(async(req, res, next)=>{
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc     Update User password
// @route    UPDATE /api/v1/auth/updatepassword
// @access   Private
exports.updatePassword = asyncHandler(async(req, res, next)=>{
    const user = await User.findById(req.user.id).select('+password');

    // check current password
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
})



// @desc     Forgot Password
// @route    POST /api/v1/auth/forgotpassword
// @access   Public
exports.forgotPassword = asyncHandler(async(req, res, next)=>{
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = await user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a put request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        });

        res.status(200).json({success: true, data: 'Email Sent'});
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorResponse('Email could not be sent ', 500));
    }

});


// @desc     Reset Password
// @route    PUT /api/v1/auth/resetpassword/:resettoken
// @access   Public

exports.resetPassword = asyncHandler(async(req, res, next)=>{
    // Get Hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
});

    if(!user){
        return next(new ErrorResponse('Invalid Token ', 400));
    }

    // Set new Password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
})



//! Get token from model, create cookie and send response
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