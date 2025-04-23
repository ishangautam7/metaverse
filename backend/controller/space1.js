const Space = require("../model/space")
const SpaceElement = require("../model/spaceelement")
const Element = require("../model/element")
const Map = require("../model/Map")
const element = require("../model/element")

module.exports.createspace = async (req, res)=>{
    try{
        const {name, height, width, userId} = req.body;
        const space = await Space.create({name, height, width, mapId})

        return res.status(200).json({msg:"Space created successfully", space})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.deletespace = async (req, res)=>{
    try{
        const {id} = req.params;
        const space = await Space.findById(id)
        if(!space){
            return res.status(400).json({msg:"No map found"})
        }
        
        const map = await Map.findById(space.mapId);
        if (!map) {
            return res.status(400).json({ msg: "Map associated with space not found" });
        }

        if (req.user.id !== map.userId.toString()) {
            return res.status(403).json({ msg: "Not authorized to delete this space" });
        }
        await Space.findByIdAndDelete(id)
        return res.status(200).json({msg:"Space deleted successfully"})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.getallspace = async (req, res)=>{
    try{
        const spaces = await Space.find().populate("mapId", "name width height");

        return res.status(200).json({
            msg:"Spaces retrieved successfully",
            spaces
        })
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.getspacebyid = async (req, res)=>{
    try{
        const id = req.params;
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.addelement = async (req, res)=>{
    try{
        const {elementId, spaceId, x, y, width, height} = req.body;

        const space = await Space.findById(spaceId)
        if(!space){
            return res.status(400).json({msg:"Space not found"})
        }

        if(X<0 || y<0 || x+width>space.width || y+height>space.height){
            return res.status(400).json({msg:"Element is out of bound"})
        }
        const elements = await Element.find({spaceId})
        for(element of elements){
            const isColliding = 
                x < element.x + element.width &&
                x + width > element.x &&
                y < element.y + element.height &&
                y + height > element.y 
            if(isColliding){
                return res.status(400).json({msg:"Element collides with other element"})
            }
        }
        const newElement = await Element.create({
            elementId, spaceId, x, y, width, height
        })
        return res.status(200).json({msg:"Element added successfully", newElement})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.deleteelement = async (req, res)=>{
    try{
        
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}