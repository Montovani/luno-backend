try {
    process.loadEnvFile()
} catch (error) {
    console.log("Can't access .env file, using default values", error)
}

// DB Connection
require('./db')

// Initial configuration (Express + port)
const express = require('express')
const app = express()
const port = process.env.PORT

// config - global  middlewares
const config = require('./config')
config(app)

// routes
app.get('/',(req,res,next)=>{
    res.status(200).json({message:"Server is running"})
})
const indexRoutes = require('./routes/index.routes')
app.use('/api',indexRoutes)

// error handeling
const handleErrors = require('./errors')
handleErrors(app)

// listening in the port
app.listen(port,()=>{
    console.log(`Server listening, local access on http://localhost:${port}`)
})
