const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const c = require('config');





// @1
// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth,

    check('text', 'text is required').not().isEmpty()

],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await User.findById(req.user.id).select('-password');

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });

            const post = await newPost.save();
            res.json(post);

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Server Error");
        }

    });

// @2
// @route   GET api/posts
// @desc    get all post
// @access  Private
router.get('/', auth, async (req, res) => {

    try {
        // @date = -1 which will give the most recent one
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);


    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }


});

// @3
// @route   GET api/posts/:id
// @desc    get post by id
// @access  Private

router.get('/:id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'post not found' });
        }

        res.json(post);


    } catch (err) {

        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'post not found' });
        }

        res.status(500).send("Server Error");
    }


});

// @4
// @route   DELETE api/posts/:id
// @desc    DELETE post by id
// @access  Private

router.delete('/:id', auth, async (req, res) => {

    try {

        const post = await Post.findByIdAndRemove(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'post not found' });
        }

        res.json({ msg: 'post has been Deleted' });


    } catch (err) {

        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'post not found' });
        }

        res.status(500).send("Server Error");
    }


});

// @5
// @route   PUT api/posts/like/:id
// @desc    like a post
// @access  Private

router.put('/like/:id' ,auth , async(req ,res)=>{
    try {

        const post = await Post.findById(req.params.id);

        // @Check if the post has already been liked
        // @Here likes is a array defined in model and filter is a array method
        if(post.likes.filter(like =>like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg : 'post already liked'})
        }

        post.likes.unshift({user :req.user.id})

        await post.save();
        res.json(post.likes)

    } catch (err) {

        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'post not found' });
        }
        res.status(500).send("server error");
    }
});

// @6
// @route   PUT api/posts/unlike/:id
// @desc    like a post
// @access  Private

router.put('/unlike/:id' ,auth , async(req ,res)=>{
    try {

        const post = await Post.findById(req.params.id);

        // @Check if the post is liked or not 
      
        if(post.likes.filter(like =>like.user.toString() === req.user.id).length == 0){
            return res.status(400).json({msg : 'post has not yet liked'})
        }

        // Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post)

    } catch (err) {

        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'post not found' });
        }
        res.status(500).send("server error");
    }
})

// @7
// @route   PUT api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post('/comment/:id', [auth,

    check('text', 'text is required').not().isEmpty()

],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id)


            //we are not storing this to db
            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };
            post.comments.unshift(newComment);

            await post.save();
            res.json(post.comments);

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Server Error");
        }

    });

// @8
// @route   DELETE api/posts/comment/:id/:comment_id
// @desc   delete the Comment on a post
// @access  Private


router.delete('/comment/:id/:comment_id' , auth , async(req , res)=>{

    try {
        const post = await Post.findById(req.params.id);

        // @Pull out the comment
        const comment = post.comments.find(comment =>comment.id === req.params.comment_id);

        // @Make sure comment exists
        if(!comment){
            return res.status(404).json({ msg: 'No comment not found' });
        }

        // @Check user
        if(comment.user.toString() !== req.user.id){
            return res.status(404).json({ msg: 'User not found' });

        }

        // @Get remove comments
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments)

    } catch (error) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
})
 


module.exports = router;