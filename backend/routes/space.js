const {createspace, fetchmaps, sendmap, singlemap, checkmap} = require("../controller/space")
const space = require("express").Router()

//used
space.post('/', createspace)
space.post('/fetch', fetchmaps)
space.get('/fetch/:ruid', sendmap)
space.post('/singlemap', singlemap)
space.post('/checkmap', checkmap)


module.exports = space;