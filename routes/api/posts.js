const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const passport = require("passport");

//post model
const Post = require("../../models/Post");

//profile model
const Profile = require("../../models/Profile");

//validation
const validatePostInput = require("../../validation/post");

//route Get api/posts/test
// desc test post route
//access Public
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));

//route Get api/posts
// desc get post
//access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostfound: "No post found" }));
});

//route Get api/posts/:id
// desc get post by id
//access Public
router.get("/:id", (req, res) => {
  Post.finById(req.params.id)
    .sort({ date: -1 })
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that id" })
    );
});

//route post api/posts
// desc create post route
//access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
      // if any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

//route delete api/posts/:id
// desc delete post route
//access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .sataus(401)
              .json({ notauthorized: "User not authorized" });
          }

          //delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

//route post api/posts/like/:id
// desc likepost route
//access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return rres
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }

          //add user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => rres.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

//route post api/posts/unlike/:id
// desc unlike post route
//access Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "you have not yet liked this post" });
          }

          //get removed index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //splice out of the array
          post.likes.splice(removeIndex, 1);

          //save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

//route post api/posts/comment/:id
// desc add comment post 
//access Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  //check validation
  if (!isValid) {
    // if any errors, send 400 with errors object
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
  .then(post => {
    const newComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user:req.user.id
    }
    //add to comments array
    post.comments.unshift(newComment);

    //save 
    post.save().then(post => res.json(post))
  })
  .catch(err => res.status(404).json({ postnotfound: 'No post found'}))
})

module.exports = router;
