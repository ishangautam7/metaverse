const { deletespace, getallspace, getspacebyid, addelement, deleteelement} = require("../controller/space1")
const {createspace, fetchmaps} = require("../controller/space")
const space = require("express").Router()

space.post('/', createspace)
space.delete('/:spaceId', deletespace)
space.get('/:spaceId', getspacebyid)
space.get('/all', getallspace)
space.post('/element', addelement)
space.delete('/element', deleteelement)
space.post('/fetch', fetchmaps)
module.exports = space;