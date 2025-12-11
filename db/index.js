const mongoose = require("mongoose");

mongoose
.connect(`${process.env.MONGODB_URI}/luno`,{
  serverSelectionTimeoutMS: 30000, 
  socketTimeoutMS: 45000,
})
.then((x)=>{
    const dbName = x.connections[0].name
    console.log(`Connectetd to Mongo! Database name: ${dbName}`)
})
.catch((error)=>{
    console.error('Error connecting to mongo: ', error)
})
