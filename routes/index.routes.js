const router = require('express').Router()

router.use('/',(req,res)=>{
    res.send('route is working')
})


module.exports = router
