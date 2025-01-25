const { addelement, updatelement, addavatar, createmap } = require('../controller/admin.js')

const admin = require('express').Router()

admin.post('/element', addelement)
admin.put('/element/:elementId', updatelement)
admin.post('/avatar', addavatar)
admin.post('/map', createmap)

module.exports = admin