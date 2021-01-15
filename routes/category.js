const express = require("express");
const router = express.Router();
const { findUserById } = require("../controllers/user");
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");
const {
  create,
  findCategoryById,
  read,

  update,
  remove,
  list,
} = require("../controllers/category");
router.post("/category/create/:userId", requireSignIn, isAuth, isAdmin, create);
router.get("/categories", list);
router.get("/category/:categoryId", read);

router.put(
  "/category/update/:categoryId/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  update
);

router.delete(
  "/category/delete/:categoryId/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  remove
);

router.param("userId", findUserById);
router.param("categoryId", findCategoryById);
exports.categoryRoutes = router;
