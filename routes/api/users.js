const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   POST api/users
// @desc    Register user
// @access  Public

router.post('/', [

    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter valid Email').isEmail(),
    check('password', 'please Enter password of minimum 6 letters of characters').isLength({ min: 6 })

],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;


        try {

            // See if user exists

            let user = await User.findOne({ email });
            if (user) {
                res.status(400).json({ errors: [{ msg: 'User Already Exists' }] })
            }

            // Get users gravatar

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                name,
                email,
                avatar,
                password

            })

            // Encrypt password
            const salt = await bcrypt.genSalt(10);

            // In this , its taking as a plain password and making it hash
            // Anything returning promise make sure you use await

            user.password = await bcrypt.hash(password, salt);
            await user.save();

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