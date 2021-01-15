const mongoose = require("mongoose");
const crypto = require("crypto");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: 32,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: String,

    role: {
      type: Number,
      default: 0,
    },
    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);
userSchema.methods = {
  authenticate: function (password) {
    return this.hashPassword(password) === this.hashed_password;
  },
  hashPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .pbkdf2Sync(password, this.salt, 100000, 64, "sha512")
        .toString("hex");
    } catch (err) {
      /////////////////////////log statement//////////////////
      console.log(err);
      /////////////////////////log statement//////////////////
      return "";
    }
  },
};

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hashed_password = this.hashPassword(password);
  })
  .get(function () {
    return this._password;
  });

module.exports = mongoose.model("User", userSchema);
