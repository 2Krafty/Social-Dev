const express = require("express");

const router = express.Router();
const gravatar = require("gravatar");
const bcyrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require('../../config/keys');
const passport = require('passport');

//load input validation
const validateRegisterInput = require('../../validation/register');

//load user model
const User = require("../../models/User");
//route Get api/users/test
// desc test users route
//access Public
router.get("/test", (req, res) => res.json({ msg: "User Works" }));

//route Get api/users/test
// desc test users route
//access Public
router.post("/register", (req, res) => {
const {errors, isValid} = validateRegisterInput(req.body);
//check validation
if(!isValid) {
return res.status(400).json(errors);
}

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists"
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm" //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcyrpt.genSalt(10, (err, salt) => {
        bcyrpt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});
//route Get api/users/login
// desc login User/ returningJWT Token
//access Public

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //find user by email
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: "User not found" });
    }
    // check password
    bcyrpt.compare(password, user.password).then(isMath => {
      if (isMatch) {
        //user matched
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        //sign token
        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
res.json({
  success: true,
  token: 'Bearer' + token})
        });
      } else {
        return res.status(400).json({ password: "Password incorrect" });
      }
    });
  });
});
//route Get api/users/current
// desc login User/ current user
// access private
router.get('/current', passport.authenticate('jwt', { session: false}), (req, res) => {
  res.json({
    id: req.user.id,
    name:req.user.name,
    email:req.user.email
  });
})

module.exports = router;
