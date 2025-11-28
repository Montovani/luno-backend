const jwt = require('jsonwebtoken')


function verifyToken (req,res,next){
   const token = req.headers.authorization?.split(" ")[1]
   if(!token){
    res.status(401).json({errorMessage: 'Token required'})
    return
   }
   try {
       const payload = jwt.verify(token,process.env.TOKEN_SECRET)
       req.payload = payload
       next()
   } catch (error) {
        res.status(401).json({errorMessage: 'Token is not valid, not exist or it has been modified '})
   }
}

module.exports = verifyToken
