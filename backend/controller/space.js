const Space = require("../model/space")
const SpaceElement = require("../model/spaceelement")
const Element = require("../model/element")
const Map = require("../model/Map")
const element = require("../model/element")
const jwt = require("jsonwebtoken")

module.exports.createspace = async (req, res)=>{
    try{
        const {name, height, width, token, image} = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id
        if(!userId){
            return res.status(400).json({msg:"Couldn't create map"})
        }

        const existingMap = await Map.findOne({userId, name})
        if(existingMap){
            return res.status(250).json({msg:"You already have a map with this name"})
        }
        const map = await Map.create({name, height, width, userId, image})
        return res.status(200).json({msg:"Map created successfully", map})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.fetchmaps = async (req, res) =>{
    try{
        const {token} = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id
        if(!userId){
            return res.status(400).json({msg:"Couldn't create map"})
        }

        const userMaps = await Map.find({userId})

        return res.status(200).json({ msg: "Maps fetched successfully", maps: userMaps });
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}