const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Connected to Database")
}).catch((err)=>{
    console.log(err)
})