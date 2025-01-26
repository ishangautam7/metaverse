const Map = require("../model/Map")
const Element = require("../model/element")
const Avatar = require("../model/avatar")
module.exports.addelement = async (req, res)=>{
    try{
        const {imageUrl, x, y, mapId, static} = req.body;

        const mapExists = await Map.findById(mapId)
        if(!mapExists){
            return res.status(400).json({msg:"Map doesnt exists"})
        }

        const newElement = await Element.create({
            x, y, imageUrl, mapId, static
        })
        return res.status(200).json({msg:"Element added successfully"})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.updatelement = async (req, res)=>{
    try{
        const {imageUrl} = req.body
        const elementId = req.params
        const checkElement = await Element.findById(elementId)
        if(!checkElement){
            return res.status(400).json({msg:"Element doesnt exists"})
        }
        await Element.updateOne({
            imageUrl
        })
        return res.status(200).json({msg:"Element updated successfully"})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.addavatar = async (req, res)=>{
    try{
        const { imageUrl, name } = req.body;
        
        if (!imageUrl || !name) {
            return res.status(400).json({ msg: "Image URL and name are required" });
        }

        const newAvatar = await Avatar.create({
            imageUrl,
            name
        });
        return res.status(200).json({ avatarId: newAvatar._id });
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

module.exports.createmap = async (req, res)=>{
    try{
        const {width, height, name, userId} = req.body;
        const existingMap = await Map.findOne({ name, userId });
        if (existingMap) {
            return res.status(400).json({ msg: "Map with the same name already exists for this user" });
        }
        const newMap = await Map.create({
            name, userId, height, width
        })
        const mapId = newMap._id
        return res.status(200).json({id:mapId})
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
}