const fs = require('fs');
const mongoose =require('mongoose');
const colors =require('colors');
const dotenv =require('dotenv');

// load env variables
dotenv.config({path: './config/config.env'});

// load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// connect to db
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true , useUnifiedTopology: true});

// read json files
const bootcamps =JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses =JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))

// import into db
const importData = async ()=>{
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        console.log('Data imported...'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

// delete data
const deleteData = async ()=>{
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

// changing a property value in Bootcamp to another e.g jobGuarantee 
const changeLocationPoint = async ()=>{
    try {
        await Bootcamp.aggregate([
            {
              '$set': {
                'location': {
                  'type': 'Point'
                }
              }
            }
          ]
            )
            console.log(`Updated`.cyan.inverse);
            console.log(await Bootcamp.find())
            process.exit();
    } catch (error) {
        console.error(error)
    }
}

if(process.argv[2] === '-i'){
    importData();
}else if(process.argv[2] === '-d'){
    deleteData();
}else if(process.argv[2] === '-u'){
    changeLocationPoint();
}