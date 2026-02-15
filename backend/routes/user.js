const { register, login, validate_token, updateAvatar } = require("../controller/user.js")
const user = require("express").Router()

user.post("/register", register)
user.post("/login", login)
user.get("/validate-token", validate_token, (req, res) => {
    res.status(200).json({ msg: "Token is valid", user: req.user });
});
user.post("/update-avatar", updateAvatar)


module.exports = user;