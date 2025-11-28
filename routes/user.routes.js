const verifyToken = require('../middlewares/auth.middleware')
const Booking = require('../models/Booking.model')
const User = require('../models/User.model')
const router = require('express').Router()
const Pet = require('../models/Pet.model')

// Is correct using the query in this way?
router.get('/', async(req,res,next)=>{
    const allowedQueries = {}

    if(req.query.city){
        allowedQueries.city = req.query.city
    }
    if(req.query.petsCategoryAllowed){
        allowedQueries.petsCategoryAllowed = req.query.petsCategoryAllowed
    }
    try {
        const userList = await User.find(allowedQueries)
        .select('-password -email -secondProfilePhot -thirdProfilePhoto -lunies -__v')
        res.status(200).json(userList)
    } catch (error) {
        res.status(404).json({errorMessage: "User not found"})
    }
})

router.get('/:userId', async(req,res,next)=>{
    try {
        const {name,aboutUser,petsCategoryAllowed,numberOfWalks,homeType,homeInformation,avatar,mainProfilePhoto,secondProfilePhoto,thirddProfilePhoto} = await User.findById(req.params.userId)
        // I can use the select in the findById to get only the information I need. Doing in the current way it will get all the information and destructuring only the ones I need. So it is not good/performance
        const pets = await Pet.find({owner: req.params.userId}) // In the foture think about to create a route in the pet specific for it.
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
        // DOn't pass as empty string
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
    // Dont need the userId and in the find and other parts use req.payload._id
     try {
        const {name,city,aboutUser,petsCategoryAllowed,numberOfWalks,homeType,homeInformation,lunies,avatar,mainProfilePhoto,secondProfilePhoto,thirddProfilePhoto} = await User.findById(req.params.userId)
        
        // Make in the booking route
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
