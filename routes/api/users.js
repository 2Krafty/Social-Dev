const express = require('express');

const router = express.Router();


//route Get api/users/test
// desc test users route
//access Public
router.get('/test', (req, res) => res.json({msg: "User Works"}));

module.exports = router;