const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { errorHandler } = require("../helpers/dbErrorHandler");
require("dotenv").config();

exports.signUp = (req, res) => {
  console.log("request body: ", req.body);
  const newUser = new User(req.body);
  newUser.save((err, user) => {
    if (err) {
      return res.status("400").json({ err: errorHandler(err) });
    } else {
      user.salt = undefined;
      user.hashed_password = undefined;
      res.json({ user });
    }
  });
};
exports.signIn = (req, res) => {
  console.log("request body: ", req.body);

  const { email, password } = req.body;
  User.findOne({ email: email }, function (err, user) {
    if (err || !user || !user.authenticate(password))
      return res.status(401).json({ error: "username or password incorrect" });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.cookie("t", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60),
    });
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

exports.signOut = function (req, res) {
  res.clearCookie("t");
  res.json({ message: "user has been signed out" });
};

//verify that payload is signed with secret
//extract payload from JWT and place it in request.auth
exports.requireSignIn = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
  algorithms: ["sha1", "RS256", "HS256"],
});

// verify that id in JWT is equal to id provided in get request
exports.isAuth = (req, res, next) => {
  const user = req.auth && req.profile && req.auth._id === req.profile.id;
  if (!user) res.status(403).json({ error: "access denied" });
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({ error: "admin resource, access denied" });
  }
  next();
};
