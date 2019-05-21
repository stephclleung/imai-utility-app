const mongoose = require('mongoose');

const imageURLSchema = new mongoose.Schema({
    imageName: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    }
}, {
        timestamps: {
            createdAt: 'created_at'
        }
    });

imageURLSchema.statics.findImageURLByName = async (iName) => {
    try {
        const i = await ImageURL.findOne({ imageName: iName });
        if (!i) {
            return null;
        }
        return i.imageUrl;
    } catch (error) {
        return error;
    }

}

const ImageURL = mongoose.model('imageURL', imageURLSchema);
module.exports = ImageURL;