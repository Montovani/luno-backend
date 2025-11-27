const verifyToken = require('../middlewares/auth.middleware')
const Booking = require('../models/Booking.model')
const User = require('../models/User.model')
const router = require('express').Router()
const Pet = require('../models/Pet.model')

// Is correct using the query in this way?
router.get('/', async(req,res,next)=>{
    
    try {
        const userList = await User.find(req.query)
        res.status(200).json(userList)
    } catch (error) {
        next(error)
    }
})

router.get('/:userId', async(req,res,next)=>{
    try {
        const {name,aboutUser,petsCategoryAllowed,numberOfWalks,homeType,homeInformation,avatar,mainProfilePhoto,secondProfilePhoto,thirddProfilePhoto} = await User.findById(req.params.userId)
        const pets = await Pet.find({owner: req.params.userId})
        res.status(200).json({
            name,
            aboutUser,
            petsCategoryAllowed,
            numberOfWalks,
            homeType,
            homeInformation,
            pets,
            avatar,
            mainProfilePhoto,
            secondProfilePhoto,
            thirddProfilePhoto
        })
    } catch (error) {
       res.status(404).json({errorMessage: "User not found"})
    }
})

router.patch('/:userId',verifyToken,async(req,res,next)=>{

    // In this way can I garantee that the person who will edit will be who has the autorization?
    if(req.payload._id !== req.params.userId){
        res.status(403).json({errorMessage: 'Not allowed to update this profile'})
        return
    }
    console.log(req.body)
    const {name,aboutUser,petsCategoryAllowed,numberOfWalks,homeType,homeInformation,avatar,mainProfilePhoto,secondProfilePhoto,thirddProfilePhoto} = req.body
    try {
        await User.findByIdAndUpdate(req.params.userId,{
            name,
            aboutUser,
            petsCategoryAllowed,
            numberOfWalks,
            homeType,
            homeInformation,
            avatar,
            mainProfilePhoto,
            secondProfilePhoto,
            thirddProfilePhoto
        })
        res.status(200).json({message: 'User updated!'})
    } catch (error) {
        next(error)
    }
})

// I think we need to use verifyToken because I want to make sure who is requesting in the url is the one who has the token. 
router.get('/dashboard/:userId',verifyToken,async(req,res)=>{
     try {
        const {name,city,aboutUser,petsCategoryAllowed,numberOfWalks,homeType,homeInformation,lunies,avatar,mainProfilePhoto,secondProfilePhoto,thirddProfilePhoto} = await User.findById(req.params.userId)
        
        const booking = await Booking.find({
            $or: [
                {host: req.payload._id}, //better to use payload because of security?
                {requester: req.payload._id}
            ]
        })
        .populate('petCared')
        const pets = await Pet.find({owner: req.payload._id})
        res.status(200).json({
            name,
            city,
            avatar,
            lunies,
            aboutUser,
            petsCategoryAllowed,
            numberOfWalks,
            homeType,
            homeInformation,
            mainProfilePhoto,
            secondProfilePhoto,
            thirddProfilePhoto,
            pets,
            booking,
        })
    } catch (error) {
        console.log(error)
       res.status(404).json({errorMessage: "User not found"})
    }
})

module.exports = router
