const api = require('express').Router()
const user = require('./user')
const space = require('./space')
const admin = require('./admin')

api.use("/auth/user", user)
api.use("/space", space)
api.use("/admin", admin)
api.get("/avatars", (req, res)=>{

})
api.get("/elements", (req, res)=>{

})

module.exports = api;