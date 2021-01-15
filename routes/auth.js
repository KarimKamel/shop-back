const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  signOut,
  requireSignIn,
} = require("../controllers/auth");
const { validator, errorHandler } = require("../validator");
router.get("/", (req, res) => {
  res.send("hello from auth get");
});
router.post("/", (req, res) => {
  console.log("in post");
  res.send("hello from auth post");
});
router.get("/signup", (req, res) => {
  console.log("in");
  res.send("hello from auth");
});

router.post("/signup", validator(), errorHandler, signUp);

router.post("/signin", signIn);
router.get("/signout", signOut);
router.get("/hello", requireSignIn, (req, res) => {
  console.log(req.auth._id);
  res.send("authenticated");
});

exports.authRoutes = router;
