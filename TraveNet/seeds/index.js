const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const travelnet = require('../models/travelnet');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/travelnet')
        .then(() => {
            console.log("CONNECTION OPEN!!");
        })
        .catch(() => {
            console.log("CONNECTION FAILS");
        })

}

const sample = array => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await travelnet.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 300) + 20;
        const camp = new travelnet({
            author: '6178f12eb5a6469c0d666f61',
            location: `${cities[random1000].city} ,${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)} `,
            image: `https://source.unsplash.com/collection/483251`,
            description: 'First campground',
            price: price
        })

        console.log(camp)
        await camp.save();
    }
}

seedDB();