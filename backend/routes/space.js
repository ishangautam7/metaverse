const { deletespace, getallspace, getspacebyid, addelement, deleteelement} = require("../controller/space1")
const {createspace, fetchmaps, sendmap, singlemap, checkmap} = require("../controller/space")
const space = require("express").Router()

//used
space.post('/', createspace)
space.post('/fetch', fetchmaps)
space.get('/fetch/:ruid', sendmap)
space.post('/singlemap', singlemap)
space.post('/checkmap', checkmap)

//unused
space.get('/all', getallspace)
space.post('/element', addelement)
space.delete('/:spaceId', deletespace)
space.delete('/element', deleteelement)
module.exports = space;