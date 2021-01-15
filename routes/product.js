const express = require("express");
const router = express.Router();
const { findUserById } = require("../controllers/user");
const {
  findProductById,
  read,
  create,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  listBySearchOr,
  photo,
  maxPrice,
  minPrice,
  countProducts,
  listSearch,
} = require("../controllers/product");
const { requireSignIn, isAuth, isAdmin } = require("../controllers/auth");

router.get("/product/:productId", read);

router.get("/products", list);
router.get("/products/search", listSearch);
router.get("/products/count", countProducts);
router.get("/products/maxprice", maxPrice);
router.get("/products/minprice", minPrice);
router.get("/product/photo/:productId", photo);
router.post("/products/by/search", listBySearch);
router.post("/products/by/searchor", listBySearchOr);

router.get("/products/categories", listCategories);
router.get("/products/related/:productId", listRelated);

router.post("/product/create/:userId", requireSignIn, isAuth, isAdmin, create);
router.delete(
  "/product/delete/:productId/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  remove
);
router.put(
  "/product/update/:productId/:userId",
  requireSignIn,
  isAuth,
  isAdmin,
  update
);

router.param("userId", findUserById);
router.param("productId", findProductById);

exports.productRoutes = router;
