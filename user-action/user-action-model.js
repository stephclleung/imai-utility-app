const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema({
    userID: {
        type: String,
        trim: true
    },
    action: {
        type: Number,
        default: 0
    }
}, {
        timestamps: {
            createdAt: 'created_at'
        }
    });

userActionSchema.statics.findUserByUserID = async (userID) => {
    const user = await UserAction.findOne({ userID });
    if (!user) {
        return null;
    }
    return user;
}

const UserAction = mongoose.model('userAction', userActionSchema);
module.exports = UserAction;