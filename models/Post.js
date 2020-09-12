const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({


    // @we are linking each profile with user
    // @here ObjectId means _id from mongodb

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },

    // @even if the user deleted their accounts the post will not be deleted

    avatar: {
        type: String
    },


    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            },

            text: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },

            date: {
                type: String,
                default: Date.now
            },
        }
    ],

    date: {
        type: String,
        default: Date.now
    }

});

module.exports = Post = mongoose.model('post', PostSchema);
