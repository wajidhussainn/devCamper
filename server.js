const express = require("express");
const path = require('path');
const dotenv = require("dotenv");
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const logger = require('./middlewares/loggerMiddleware')
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorMiddleware = require('./middlewares/errorHandlerMiddleware');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
// load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();
// connecting to database
connectDB();

// Body Parser
app.use(express.json())

// Cookie Parser
app.use(cookieParser());

// const logger = (req, res, next)=>{ //shifted to middlewares folder
//   // req.hello = 'hello world'; // can set a property on request object like this and can access it inside controllers
//   // console.log('middleware ran');
//   console.log(`${req.method} ${req.protocol}://${req.get('host')}, ${req.originalUrl}`);
//   next();
// }

// dev logging middleware
// app.use(logger); //instead we are using morgan
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

// File uploading
app.use(fileUpload());

// set static folder
// can access it through browser route localhost:5000/uploads/photoname.jpg
app.use(express.static(path.join(__dirname, 'public')));

// mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.get('/', (req, res)=>{
  res.status(200).json({success: true, message: 'API is working'});
}); 

app.use(errorMiddleware);



const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

//handle unHandled promise rejections
process.on('unhandledRejection', (err, promise)=>{
  console.log(`Error: ${err.message}`.red.bold);
  //close server and exit process
  server.close(()=>process.exit(1))
})