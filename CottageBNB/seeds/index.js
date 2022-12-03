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
            user: '638aa7c2db008936fd6acf5c', // so that when first seeded, the first 50 Cottages have some users that submitted them.
            location: `${randomCity}, ${randomState}`,
            images: [
                {
                    "url": "https://images.unsplash.com/photo-1588192805356-858f33ad318a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80",
                    "filename": "CottageBNB/dxdmx413mx42timadwug",
                },
                {
                    "url": "https://images.unsplash.com/photo-1587061949409-02df41d5e562?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
                    "filename": "CottageBNB/k3n6gimno2qgjrh7xy4h"
                },
                {
                    "url": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80",
                    "filename": "CottageBNB/fz2ae1geid8l2uqqvow9",
                }
                ]
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