const verifyToken = require('../middlewares/auth.middleware')
const Pet = require('../models/Pet.model')
const User = require('../models/User.model')

const router = require('express').Router()

router.post('/', verifyToken, async(req,res,next)=>{
    try {
    //Guard Clause to limit  the amount of dogs.
        const totalPets = await Pet.countDocuments({owner: req.payload._id})
        if(totalPets >= 5){
            res.status(400).json({errorMessage: 'User exceeded the total of 5 dogs'})
            return
        }
    const {name,category,avatar,gender,dateOfBirth,isHouseTrained,isNeutered,specialInstructions} = req.body
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

router.get('/:petId',async(req,res,next)=>{
    try {
        const petInfo = await Pet.findById(req.params.petId)
        res.status(200).json(petInfo)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.patch('/:petId',verifyToken,async (req,res,next)=>{
    try {
        //Check if the token is the owner  of the pet
        const petOwnerId = await Pet.findById(req.params.petId).select('owner')
    
        if(!petOwnerId.owner.equals(req.payload._id)){
            res.status(400).json({errorMessage: 'User is not authorized to update pet info'})
            return
        }
    
       const {name,category,avatar,gender,dateOfBirth,isHouseTrained,isNeutered,specialInstructions} = req.body
        console.log(name)
       await Pet.findByIdAndUpdate(req.params.petId,{
            name,
            category,
            avatar,
            gender,
            dateOfBirth,
            isHouseTrained,
            isNeutered,
            specialInstructions,
       })
        res.status(200).json({message: "Pet updated"})
    } catch (error) {
        next(error)
    }
})

router.delete('/:petId',verifyToken,async(req,res,next)=>{
    try {
         //Check if the token is the owner of the pet
        const petOwnerId = await Pet.findById(req.params.petId).select('owner')
    
        if(!petOwnerId.owner.equals(req.payload._id)){
            res.status(400).json({errorMessage: 'User is not authorized to delete pet'})
            return
        }

        await Pet.findByIdAndDelete(req.params.petId)
        res.sendStatus(200)
    } catch (error) {
        next(error)
    }
})

router.get('/owner/:userId',async(req,res,next)=>{
    try {
        const pets = await Pet.find({owner: req.params.userId})
        res.status(200).json(pets)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

module.exports = router
