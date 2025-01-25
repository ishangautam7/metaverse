const {register, login, validate_token} = require("../controller/userController.js")

const router = require("express").Router()

router.post("/register", register)
router.post("/login", login)
router.get("/validate-token", validate_token, (req, res) => {
    res.status(200).json({ message: "Token is valid", user: req.user });
});

module.exports = router;