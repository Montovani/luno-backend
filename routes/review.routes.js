const verifyToken = require('../middlewares/auth.middleware')
const Booking = require('../models/Booking.model')
const Review = require('../models/Review.model')

const router = require('express').Router()

// Create a new review
router.post('/',verifyToken,async(req,res,next)=>{
    try {
        const {bookSitting,stars,text} = req.body 
        console.log(bookSitting)
    
        // Guard Clause: Check if the token ID is the same requester(ID) of the BookingSitting ID
        const bookingInfo = await Booking.findById(bookSitting).select('requester status review')

        if(!bookingInfo.requester.equals(req.payload._id)){
            res.status(403).json({errorMessage: 'User is not authorized to create the review'})
        }

        // Guard Clause: Check if the booking has the status completed 
        if(bookingInfo.status !== 'completed'){
            res.status(400).json({errorMessage: 'You cannot add review if the booking is not completed'})
        }
        if(bookingInfo.review){
            res.status(400).json({errorMessage: 'This booking has already a review, please delete in order to create a new one'})
        }

        const review = await Review.create({
            owner: req.payload._id,
            text,
            stars,
            bookSitting,
        })


        await Booking.findByIdAndUpdate(bookSitting,{
            review,
        })

        res.status(201).json({message: 'Review Created'})
        
    } catch (error) {
        next(error)
    }

})

// Get all the reviews by user
router.get('/user',verifyToken,async(req,res,next)=>{
    try {
        const reviews = await Booking.find({host: req.payload._id})
        .select('review')
        .populate('review')
        
        res.status(200).json(reviews)
    } catch (error) {
        next(error)
    }
})

module.exports = router
