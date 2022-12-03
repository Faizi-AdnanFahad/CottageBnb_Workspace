const mongoose = require('mongoose');
const Cottage = require('../models/cottage.js');
const Cities = require('./cities.js');
const { places, descriptors } = require('./seedHelper.js');

/********************************************************/

// Checking wether database was connected or not
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected...");
});

/********************************************************/

// 1. Connect Mongoose to Mongod
main()
    .then(() => {
        console.log("Mongo Successfully Connected...");
    })
    .catch((err) => {
        console.log("OH NO MONGO ERROR!")
        console.log(err)
    });

async function main() { // connects Mongoose to Mongod
    await mongoose.connect('mongodb://localhost:27017/cottage-bnb', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }); // creates a data base called 'cottage-bnb'
};

/********************************************************/

let seedDB = async () => {
    await Cottage.deleteMany({}); // delete everything in the database === Reset the database
    for (let i = 0; i < 5; i++) {
        // Get a random City and state from an array of 1000 location object.
        let random1000 = Math.floor((Math.random() * 1000));
        let randomCity = Cities[random1000].city;
        let randomState = Cities[random1000].state;

        // Get a random Descriptor and place, combine it to form a random title.
        let randomDescriptorNum = Math.floor(Math.random() * descriptors.length);
        let randomPlacesNum = Math.floor(Math.random() * places.length);
        let price = Math.floor(Math.random() * 100);
        let randomDescriptor = descriptors[randomDescriptorNum];
        let randomPlaces = places[randomPlacesNum];

        // Create a new model and add it to the database
        let newCottage = new Cottage({
            title: `${randomDescriptor} ${randomPlaces}`,
            price: price,
            user: '634b20768453725137c959a6', // so that when first seeded, the first 50 Cottages have some users that submitted them.
            location: `${randomCity}, ${randomState}`,
            images: [
                {
                    "url": "https://res.cloudinary.com/dfkwvksuu/image/upload/v1668031877/YelpCamp/fz2ae1geid8l2uqqvow9.avif",
                    "filename": "YelpCamp/dxdmx413mx42timadwug",
                },
                {
                    "url": "https://res.cloudinary.com/dfkwvksuu/image/upload/v1668036265/YelpCamp/crqitupncd0tgboclkep.avif",
                    "filename": "YelpCamp/k3n6gimno2qgjrh7xy4h"
                },
                {
                    "url": "https://res.cloudinary.com/dfkwvksuu/image/upload/v1668205152/YelpCamp/xtnhz3t79f1lbbngzdu1.avif",
                    "filename": "YelpCamp/fz2ae1geid8l2uqqvow9",
                }]
            , 
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sunt dolorem quo et assumenda tenetur reprehenderit, illo doloribus. Magnam amet iure expedita at quia? Natus culpa libero minima, quos eveniet omnis.',
            geometry: { 
                "type" : "Point", "coordinates" : [ Cities[random1000].longitude, Cities[random1000].latitude ] 
            }
    });
        await newCottage.save();
    }
}

// Closes the database conncetions
seedDB().then(() => {
    mongoose.connection.close();
    console.log("Mongo Successfully Disconnected...")
});