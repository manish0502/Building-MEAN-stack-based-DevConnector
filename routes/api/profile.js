const express = require('express');
const router = express.Router();
//@calling request & config for github
const request = require('request');
const config  = require('config');

const Profile = require('../../models/Profile');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// @also bring user model because we are attaching it with user profile
const User = require('../../models/User');
const { response } = require('express');
// @1
// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
// @getting profile of user using profile id not using user_id

router.get('/me', auth, async (req, res) => {

    try {

        // @indirectly we are refrencing the user model and populating fields from there

        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        // @check whether user exists or not

        if (!profile) {

            return res.status(400).json({ msg: 'There is no profile for the  user' });

        }

        res.json(profile);

    } catch (err) {

        console.error(err.message);
        res.status(500).send('server error');
    }

});


// @2
// @route   POST api/profile
// @desc    Create and update the profile
// @access  Private
router.post('/', [auth,

    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),

],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        // @Build profile object

        let profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // @Build social object

        profileFields.social = {};

        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            // @Update the profile
            if (profile) {
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
                return res.json(profile);
            }

            // @Create one if not found
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Server Error");

        }

    })




// @3   
// @route   GET api/profile/
// @desc    Get All profile
// @access  Public
// @this api, we are using profile id to get the details not by userid

router.get('/all', async (req, res) => {

    try {

        // @here i am using profiles as variable to get all the profiles using profile_id
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {

        console.error(err.message);
        res.status(500).send('server error');

    }
})


// @4
// @route   GET api/profile/user/:user_id
// @desc    Get All profile
// @access  Public
// @this api, we are using user id to get the details not by profile_id
// @here id is coming from the url so use params

router.get('/user/:user_id', async (req, res) => {

    try {

        // @here i am using profile as variable to get specific user using user_id 
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);


        // @Check whether profile exists or not
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        res.json(profile);

    } catch (err) {

        console.error(err.message);
        // @what if we are giving wrong format of objectid ,then also it should give the msg like "profile not exists instead of server error"
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: ' bc is no profile for this user kindly enter correct format' });
        }

        res.status(500).send('server error');

    }
})



// @5
// @route   DELETE api/profile
// @desc    Delete profile , user & posts
// @access  Private so use Auth

router.delete('/', auth, async (req, res) => {

    try {
        // @todo - remove posts


        // @Remove profile

        await Profile.findOneAndRemove({ user: req.user.id });

        // @Remove user so use actual _id from db
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User Deleted' });

    } catch (err) {

        console.error(err.message);
        res.status(500).send('server error');

    }
});



// @6
// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private so use Auth
// @this is Array of object
router.put('/experience', [auth,

    check('title', 'Title  is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()

],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }


        try {
            const profile = await Profile.findOne({ user: req.user.id });
            // @this is arrray of object so only using unshift and it will add the element at the start of the index 
            profile.experience.unshift(newExp)
            await profile.save();
            res.json(profile);
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send({ msg: "server Error" })
        }
    });


// @7
// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private so use Auth
router.delete('/experience/:exp_id', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // @GEt remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {

        console.error(err.message);
        res.status(500).send('server error');

    }
});


// @8
// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private so use Auth
// @this is Array of object

router.put('/education', [auth,

    check('school', 'school  is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty()
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const Edu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }


        try {
            const profile = await Profile.findOne({ user: req.user.id });
            // @this is arrray of object so only using unshift and it will add the element at the start of the index 
            profile.education.unshift(Edu);
            await profile.save();
            res.json(profile);
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send({ msg: "server Error" })
        }
    });

// @9
// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private so use Auth
router.delete('/education/:edu_id', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // @GEt remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1); 
        await profile.save();
        res.json(profile);
        return res.status(400).json({ msg: 'No education details avaiable for this profile' });

    } catch (err) {

        console.error(err.message);
        res.status(500).send('server error');

    }
});

// @10
// @route   DELETE api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public

router.get('/github/:username' ,(req ,res)=>{

    try{
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page =5&sort=created:
            asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method : 'GET',
            headers: {'user-agent':'node.js'}
        };
        request(options ,(error , response ,body)=>{
            if(error) console.log(error);
            if(response.statusCode !== 200){
                res.status(404).json({ msg :'No github profile found'})
            }
            res.json(JSON.parse(body));
        })


    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
});



module.exports = router;