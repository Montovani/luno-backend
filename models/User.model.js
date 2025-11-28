const {Schema, model} = require('mongoose')
const NETHERLANDS_CITIES = require('../utils/enum.utils')

const userSchema = new Schema ({
    name: {
        type: String,
        required: true,
        maxlength: [50, "Name cannot exceed 50 characters"],
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: [254, "email should not exceed 254 characters"],
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        maxlength: [130, "password should not exceed 130 characters"],
        trim: true,
    },
    city: {
        type: String,
        enum: NETHERLANDS_CITIES,
        required: true,
    },
    country:{
        type: String, 
        default: 'Netherlands' // Only Netherlands for the MVP, could add more in the future.
    },
    address:{
        type: String,
        trim: true,
        maxlength: 1000
    },
    coordinates: {
        type: [Number],
        maxlength: 2,
    },
    aboutUser: {
        type: String,
        trim: true,
        maxlength: [400, "please, keep your about text bellow 400 characters"],
    },
    petsCategoryAllowed: { // Can use camelCase here? Yes
        type: [String],
        enum: ['small dog','medium dog','big dog','cat', 'rabbit', 'hamster'],
    },
    numberOfWalks: {
        type: String,
        trim: true
    },
    homeType: { //Standadrize the names it was home and house and also the order
        type: String,
        enum: ['flat','apartment','house','boat']
    },
    homeInformation: {
        type: [String],
        enum: ['non-smoking','Pets not allowed on bed','Pets not allowed on furniture','No kids present','Does not have garden','Stairs']
    },
    preferedCheckIn: {
        type: String,
        trim: true
        //Maybe add a enum here with options? 
    },
    preferedCheckOut:{
        type: String,
        trim: true
    },
    headline: {
        type: String,
        trim: true,
        maxlength: [68, "please keep bellow 68 characters your headline"]
    },
    avatar: {
        type: 'String',
        default: 'http://default-adredd.jpg'
    },
    mainProfilePhoto: {
        type: 'String',
        default: 'http://default-adredd.jpg'
    },
    secondProfilePhoto: {
        type: 'String',
        default: 'http://default-adredd.jpg'
    },
    thirddProfilePhoto: {
        type: 'String',
        default: 'http://default-adredd.jpg'
    },
    lunies: {
        type: Number,
        default: 0, 
    }
})

const User = model('User',userSchema)

module.exports = User
