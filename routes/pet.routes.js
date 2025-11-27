const verifyToken = require('../middlewares/auth.middleware')
const Pet = require('../models/Pet.model')

const router = require('express').Router()

router.post('/', verifyToken, async(req,res,next)=>{
    const {name,category,avatar,gender,dateOfBirth,isHouseTrained,isNeutered,specialInstructions,owner} = req.body
    try {
        await Pet.create({
            name,
            category,
            avatar,
            gender,
            dateOfBirth,
            isHouseTrained,
            isNeutered,
            specialInstructions,
            owner: req.payload._id
        })
        res.status(201).json({message: 'Pet created'})
    } catch (error) {
        console.log(error)
        next(error)
    }

})

module.exports = router
