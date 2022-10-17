
// @desc     Logs request method, protocol , host and original url 
// this way we can build our custom middleware , we will use morgan instead of this for logging
const logger = (req, res, next)=>{
    // req.hello = 'hello world'; // can set a property on request object like this and can access it inside controllers
    // console.log('middleware ran');
    console.log(`${req.method} ${req.protocol}://${req.get('host')}, ${req.originalUrl}`);
    next();
  }
  module.exports = logger;