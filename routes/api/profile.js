const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const router = express.Router();

//load input validation
const validateProfileInput = require("../../validation/register");
const validateExperienceInput = require("../../validation/login");

//load profile model
const Profile = require("../../models/Profile");
//load user profile
const User = require("../../models/User");

//route Get api/profile/test
// desc test profile route
//access Public
router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

//route Get api/profile/test
// desc test profile route
//access Public
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(errors));
  }
);

//route post api/profile/test
// desc create or edit user profile
//access Public
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //check validation
    if(!isValid) {
      //return any errors with 400 status
      return res.status(400).json(errors);
    }
    // get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFieldybody.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //skills - split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //social
    profileFields.social = {};
    if (req.body.youtube) profileFields.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //update
        Profile.findByIdAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
        .then(profile => res.json(profile));
      } else {
        //create
        //check to see handle exist
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if(profile) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
          }

          //save profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);


//route post api/profile/experience
// desc add experience to profile
//access Private
router.post('/experience', passport.authenticate('jwt', { session: false}),(req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);

  //check validation
  if(!isValid) {
    //return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({user: req.user.id})
  .then(profile => {
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    }

    //add to exp array
    profile.experience.unshift(newExp);

    profile.save().then(profile => res.json(profile));
  })
})

module.exports = router;
