const mongoose = require('mongoose');

// @Mongoose is an object data modeling (ODM)

const ProfileSchema = new mongoose.Schema({

    // @we are linking each profile with user
    // @here ObjectId means _id from mongodb

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    company: {
        type: String
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
        required: true
    },
    bio: {
        type: String,
    },
    githubusername: {
        type: String
    },

    // @Adding experience details as Array of Objects

    experience: [{

        title: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        location: {
            type: String,
        },
        from: {
            type: String,
            required: true
        },
        to: {
            type: Date

        },
        current: {
            type: Boolean,
            default: false

        },
        description: {
            type: String,

        }

    }
    ],

    // @Adding educational details as Array of Objects

    education:
        [
            {

                school: {
                    type: String,
                    required: true
                },
                degree: {
                    type: String,
                    required: true
                },
                fieldofstudy: {
                    type: String,
                    required: true
                },
                from: {
                    type: String,
                    required: true
                },
                to: {
                    type: Date
                },
                current: {
                    type: Boolean,
                    default: false
                },
                description: {
                    type: String,

                }

            }
        ],

    // @adding social media detils its object of objects
    social: {

        youtube: {
            type: String

        },
        twitter: {
            type: String

        },
        facebook: {
            type: String,
        },
        linkedin: {
            type: String

        },
        instagram: {
            type: String,

        }

    },

    date: {
        type: Date,
        default: Date.now
    }
});


//Alternative for data Modelling

module.exports = Profile = mongoose.model('profile', ProfileSchema);