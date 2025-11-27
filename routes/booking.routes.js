const Booking = require('../models/Booking.model')

const router = require('express').Router()

module.exports = router



router.post('/',async(req,res,next)=>{
    const {requester,host,status,lunies,message,petCared,review} = req.body
    try {
        await Booking.create({
            requester,
            host,
            status,
            lunies,
            message,
            petCared,
            review
        })
        res.status(201).json({message: 'Booking created'})
    } catch (error) {
        next(error)
    }
})
