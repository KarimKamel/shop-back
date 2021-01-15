const User = require("../models/user");
exports.findUserById = function (req, res, next, id) {
  User.findById(id, (err, user) => {
    if (err || !user) {
      res.status(400).json({
        error: "user not found",
      });
    } else {
      req.profile = user;
      next();
    }
  });
};
exports.read = (req, res, next) => {
  if (req.profile) {
    const user = req.profile;
    user.hashed_password = undefined;
    user.salt = undefined;
    return res.json({ user });
  }
};

exports.update = (req, res, next) => {
  User.findByIdAndUpdate(
    req.profile.id,
    { $set: req.body },
    { new: true }
  ).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        error: "not authorized to perform this operation",
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json({ user });
  });
};
