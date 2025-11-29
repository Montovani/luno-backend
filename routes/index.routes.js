const router = require('express').Router()
const authRoutes = require('./auth.routes')
const  userRoutes = require('./user.routes')
const bookingRoutes = require('./booking.routes')
const petRoutes = require('./pet.routes')
const reviewRoutes = require('./review.routes')

router.use('/auth', authRoutes)
router.use('/user',userRoutes)
router.use('/booking',bookingRoutes)
router.use('/pet', petRoutes)
router.use('/review',reviewRoutes)

module.exports = router
