const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next)=>{

    let error = {...err};
    // log to console for dev
    // console.log(err);
    // res.status(500).json({success: false,
    // error: err.message});

// mongoose bad object id
error.message = err.message;
// console.log(err.name)
if(err.name === 'CastError'){
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
}

// mongoose duplicate key
if(err.code === 11000){
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
}

// mongoose validation error
if(err.name === 'ValidationError'){
    //getting error messages when we leave a field empty which are inside err array 
    const message = Object.values(err.errors).map(val=>val.message);
    error = new ErrorResponse(message, 400) 
}
// instead of statuscode we are using errorResponse class from utils so we will create new errorResponse class object wherever we are handling errors in controller
    res.status(error.statusCode || 500).json({success: false,
        error: error.message || 'Server Error'
    });
}
module.exports = errorHandler;