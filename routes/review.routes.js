const verifyToken = require('../middlewares/auth.middleware')
const Booking = require('../models/Booking.model')
const Review = require('../models/Review.model')

const router = require('express').Router()

// Create a new review
router.post('/',verifyToken,async(req,res,next)=>{
    try {
        const {bookSitting,stars,text} = req.body 
    
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
            res.status(400).json({errorMessage: 'This booking has already a review, please delete or update'})
        }

        const review = await Review.create({
            owner: req.payload._id,
            text,
            stars,
            bookSitting,
        })

        // Update the review in the Booking document.
        // Don't need this double relations, I can delete the review from the booking model. if I want to get both I can create a new route.
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

// Update a review
router.put('/:reviewId', verifyToken, async(req,res,next)=>{
    try {
        // You can do another approach which is do the condition in the query 1 - 1 -req.params.reviewId (id of the review) and the owner should be the same as the payload. And in the end you do a condition if the document return a null you can send res saying that you didnt find the document.


        const reviewOwnerId = await Review.findById(req.params.reviewId).select('owner').lean()
        
        //Instead o .lean() I can use double == because it will convert to compare.
        
        if(!reviewOwnerId.owner.equals(req.payload._id)){
            res.status(401).json({message: 'User is not able to edit the review'})
            return
        }
        
        const {text,stars} = req.body
        await Review.findByIdAndUpdate(req.params.reviewId, {
            text,
            stars
        })
        res.status(200).json({message: "Review Update!"})

    } catch (error) {
        next(error)
    }
})

// Delete Review
router.delete('/:reviewId', verifyToken, async(req,res,next)=>{
    try {
        
        const reviewOwnerId = await Review.findById(req.params.reviewId).select('owner').lean()

         if(!reviewOwnerId.owner.equals(req.payload._id)){
            res.status(401).json({message: 'User is not able to edit the review'})
            return
        }

        await Review.findByIdAndDelete(req.params.reviewId)

        res.status(200).json({message: 'Review Deleted'})

    } catch (error) {
        next(error)
    }
})

module.exports = router
