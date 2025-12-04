const express = require('express')
const logger = require('morgan')
const cors = require('cors')


function config(app){

    app.set('trusty proxy',1)
    
    app.use(logger('dev'))
    app.use(
        cors({
            origin: [process.env.ORIGIN],
            credentials: true
        })
    )
    app.use(express.json())
    app.use(express.urlencoded({extended: false}))

}

module.exports = config
