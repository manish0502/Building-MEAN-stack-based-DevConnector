const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

// @route   api/auth
// @desc    Authenticate user and Get Token
// @access  Public

router.get('/', auth, async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select('-password');
        return res.json(user);

    }catch(err) {

        console.error(err.message);
        res.status(500).send('server error');

    }
});
// @route   POST api/users
// @desc    Register user
// @access  Public

router.post('/', [

    check('email', 'Please enter valid Email').isEmail(),
    check('password', 'password is required').exists()

],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;


        try {

            // See if user exists

            let user = await User.findOne({ email });
            if (!user) {
                res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
            }

         // @comapring plain password and user password
         
            const isMatch = await bcrypt.compare(password , user.password)
          
            if(!isMatch){
                res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }]})  
            }

         

            // Return JsonWebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }
            const privatekey = config.get('jwtSecret');
            
            jwt.sign(
                payload,
                privatekey,
                { expiresIn: 36000 },
              
                (err, token) => {
                    if (err) throw err;
                    res.json({ token })
                }
            );




        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error')
        }

    })

module.exports = router;