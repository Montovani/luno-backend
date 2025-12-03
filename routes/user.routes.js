const verifyToken = require('../middlewares/auth.middleware')
const Booking = require('../models/Booking.model')
const User = require('../models/User.model')
const router = require('express').Router()
const Pet = require('../models/Pet.model')


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
        .select('-password -email -secondProfilePhot -thirdProfilePhoto -lunies -__v -address -aboutUser')
        res.status(200).json(userList)
    } catch (error) {
        res.status(404).json({errorMessage: "User not found"})
    }
})

router.get('/dashboard',verifyToken,async(req,res)=>{
    try {
        const userData = await User.findById(req.payload._id)
        .select('-password -email -address')
        .lean()
        
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
            ...userData,
            pets,
            booking,
        })
    } catch (error) {
        console.log(error)
       res.status(404).json({errorMessage: "User not found"})
    }
})

router.get('/:userId', async(req,res,next)=>{
    try {
        const userInfo = await User.findById(req.params.userId)
        .select('-password -email -lunies -__v -address')
        .lean()

        // In the future think about to create a route in the pet specific for it.
        const pets = await Pet.find({owner: req.params.userId}).lean() 
        
        res.status(200).json({
            ...userInfo,
            pets
        })
    } catch (error) {
       res.status(404).json({errorMessage: "User not found"})
    }
})

router.patch('/:userId',verifyToken,async(req,res,next)=>{

    if(req.payload._id !== req.params.userId){
        res.status(403).json({errorMessage: 'Not allowed to update this profile'})
        return
    }

    const {name,city,aboutUser,petsCategoryAllowed,numberOfWalks,homeType,homeInformation,avatar,mainProfilePhoto,secondProfilePhoto,thirddProfilePhoto} = req.body

    if(!name || !city){
        res.status(400).json({errorMessage:"You must provide the name and city"})
    }
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

router.delete('/:userId',verifyToken,async(req,res,next)=>{
    if(req.payload._id !== req.params.userId){
        res.status(403).json({errorMessage: 'Not allowed to update this profile'})
        return
    }
    try {
        await User.findByIdAndDelete(req.payload._id)
        res.sendStatus(200)
    } catch (error) {
        next(error)
    }
})

module.exports = router
