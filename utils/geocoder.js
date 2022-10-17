const NodeGeocoder = require('node-geocoder');

const options ={
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: 'Yes42GNf7nMOmmAzcS8599sa9bLX4bAK',
    formatter: null
}


const geocoder = NodeGeocoder(options);
module.exports = geocoder;