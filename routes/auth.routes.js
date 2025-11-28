const User = require('../models/User.model')
const jwt = require('jsonwebtoken')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const verifyToken = require('../middlewares/auth.middleware')


// Signup
router.post('/signup',async(req,res)=>{
    const {name,email,password,city} = req.body
    const errors = []

    // 1 Guard Clause to check if the user filled the inputs:
    if(!name){
       errors.push('Name is required.')
    }
    if(!email){
        errors.push('Email is required.')
    }
    if(!password){
        errors.push('Password is required.')
    }
    if(!city){
        errors.push('You must provide a city.')
    }

    const errorMessage = errors.join(' ')
    if(errors.length > 0){
        res.status(400).json({errorMessage})
        return
    }

    // Guard Clause to check if the email has the correct format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g

    if(!emailRegex.test(email)){
        res.status(400).json({errorMessage: 'Invalid email format'})
        return
    }

    //Guard Clause to check if the password is Strong Enought.
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/g

    try {
        const response = await User.findOne({email: email})
        if(response){
            res.status(400).json({errorMessage: 'This email is already in use.'})
            return
        }
    } catch (error) {
        console.log(error)
    }

    if(!passwordRegex.test(password)){
        res.status(400).json({errorMessage: 'Password must be at least 8 characters and include one uppercase letter and one number.'})
        return
    }

    //Check if the email is unique and hash password
    try {
        const hashedPassword  = await bcrypt.hash(password,12)
        await User.create({
            name,
            email,
            password: hashedPassword,
            city
        })
        res.status(201).json({message: "User created successfully"})
    } catch (error) {
        console.log(error)
    }
    
})

//Login
router.post('/login',async(req,res)=>{

    const {email,password} = req.body

    //Guard clause: If the user give or the password or the email
    if(!email && !password){
        res.status(401).json({errorMessage: 'You must provide the email and password'})
        return
    }
    if(!email){
        res.status(401).json({errorMessage: 'Please, provide your email'})
        return
    }
    if(!password){
        res.status(401).json({errorMessage: 'Please, provide your password'})
        return
    }

    // Check if the email provided is in the database, and if yes check the password. NOTE Stantarize the techniques for guard clause.
    try {
        const userFound = await User.findOne({email: email})
        if(!userFound){
            res.status(401).json({errorMessage: 'This email is not registered'})
            return
        }
        const passwordCheck = await bcrypt.compare(password, userFound.password)
        if(!passwordCheck){
            res.status(401).json({errorMessage: "Incorrect password, please try again"})
            return
        }
            const {email,name,_id} = userFound
            const payload = {
                _id,
                email,
                name
            }
            const authToken = jwt.sign(
                payload,
                process.env.TOKEN_SECRET,
                {algorithm: 'HS256', expiresIn: '7d'}
            )
            res.status(200).json({authToken})
            return
    } catch (error) {
        console.log(error)
    }
})

//Verify (for the frontend verify if the token is valid before initializing te application)

router.get('/verify',verifyToken, (req,res)=>{
 res.status(200).json(req.payload)
})



module.exports = router
