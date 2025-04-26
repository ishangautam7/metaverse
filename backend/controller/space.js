const Map = require("../model/Map")
const User = require("../model/user")
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

module.exports.sendmap = async (req, res) => {
    try{
        const { ruid } = req.params;
        const map = await Map.findOne({mapUID: ruid})
        if(!map){
            return res.status(250).json({msg:"No map found"})
        }
        return res.status(200).json({msg:"Map Found", map})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.singlemap = async (req, res) => {
    try{
        const {mapId} = req.body
        const map = await Map.findOne({_id: mapId})
        const user = await User.findOne({_id: map.userId})
        return res.status(200).json({msg:"Detail for single map fetched", map, owner:user.username})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.checkmap = async(req, res) => {
    try{
        const {mapUID} = req.body
        const map = await Map.findOne({mapUID: mapUID})
        if(map){
            return res.status(200).json({found: true})
        }
        return res.status(200).json({found:false})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}