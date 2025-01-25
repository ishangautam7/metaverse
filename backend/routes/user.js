const {register, login, validate_token} = require("../controller/userController.js")
const {metadata, metadatabulk} = require("../controller/metadata.js")
const user = require("express").Router()

user.post("/register", register)
user.post("/login", login)
user.get("/validate-token", validate_token, (req, res) => {
    res.status(200).json({ message: "Token is valid", user: req.user });
});

user.post("/metadata", metadata)
user.get("/metadata/bulk", metadatabulk)

module.exports = user;