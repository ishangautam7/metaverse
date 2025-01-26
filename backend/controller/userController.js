const User = require("../model/user.js")
const bcrypt = require("bcryptjs");
const path = require('path');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports.register = async(req, res, next)=>{
    try {
        const {username, email, password } = req.body;
        console.log(req.body)
        const usernameCheck = await User.findOne({ email })
        if (usernameCheck) {
            return res.status(409).json({ msg: "Username already exists"})
        }
        console.log(usernameCheck)
        const emailCheck = await User.findOne({ email })
        if (emailCheck) {
            return res.status(409).json({ msg: "Email already exists"})
        }
        console.log(emailCheck)
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            username, email, password: hashedPassword
        })
        console.log(user)
        delete user.password;
        return res.status(201).json({msg:"User created successfully"})
    }
    catch (err) {
       return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.login = async(req, res, next)=>{
    try{
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({msg:"User not found"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        const token = generateToken(user._id);
        return res.status(200).json({
            msg:"Login successful",
            token,
            user: {id: user._id, username: user.username}
        })
    }catch(err){
        return(res.status(500).json({msg:"Internal Server Error", err}))
    }
}

module.exports.validate_token = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next(); // Proceed to the next middleware or route handler
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Token has expired. Please log in again." });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid token. Authentication failed." });
        } else {
            return res.status(500).json({ message: "An error occurred while verifying the token." });
        }
    }
};
