const express = require("express");
const router = express.Router();
const { findUserById, read, update } = require("../controllers/user");
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");

router.get("/secret/:userId", requireSignIn, isAuth, isAdmin, (req, res) => {
  res.json({ user_profile: req.profile, user_auth: req.auth });
});

//verifies that id belongs to a user in database
//places user object in req.profile
router.param("userId", findUserById);

router.get("/user/:userId", requireSignIn, isAuth, read);
router.put("/user/:userId", requireSignIn, isAuth, update);

exports.userRoutes = router;
