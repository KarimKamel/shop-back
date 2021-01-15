const { check, validationResult } = require("express-validator");
function userSignupValidator(req, res, next) {
  console.log("validator");

  return [
    check("name", "Name is required").notEmpty(),
    check("email", "email must be between 3 and 32 characters long")
      .matches(/.+\@+.+\.+.+/)
      .withMessage("email must contain @ symbol")
      .isLength({
        min: 3,
        max: 32,
      }),
    check("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters long")
      .matches(/\d+/)
      .withMessage("password must contain at least one number"),
  ];
}

function errorHandler(req, res, next) {
  console.log("handler");
  const errorsObj = validationResult(req);
  if (errorsObj.isEmpty()) {
    return next();
  } else {
    // Oh noes. This user doesn't have enough skills for this...

    const firstError = errorsObj.errors[0];
    // const firstError = errors.errors.map(error => error.msg)[0];
    return res.status("400").json({ error: firstError.msg });
  }
}
exports.errorHandler = errorHandler;
exports.validator = userSignupValidator;
