const Product = require("../models/product");
const Category = require("../models/category");
const formidable = require("formidable");
const fs = require("fs");

const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");
exports.read = function (req, res, next) {
  res.json({ product: req.product });
};

exports.findProductById = function (req, res, next, id) {
  Product.findById(id, (err, product) => {
    if (err || !product) {
      res.status(400).json({
        error: "product not found",
      });
    } else {
      req.product = product;
      next();
    }
  });
};

exports.update = (req, res) => {
  const form = formidable({ keepExtension: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const { name, description, category, price } = fields;
    if (!name || !description || !category || !price)
      return res.status(400).json({ error: "all fields are required" });
    const product = req.product;
    Object.assign(product, fields);
    if (files.photo) {
      if (files.photo.size > 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "image size cannot be more than 1MB " });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, product) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }
      res.json({ product });
    });
  });
};
exports.remove = (req, res) => {
  console.log("from delete product");

  Product.findOneAndDelete({ _id: req.product.id }, (err, product) => {
    if (err || !product) {
      return res.status(400).json({
        error: "product not found",
      });
    }
    res.json({ product: req.product.name, message: "deleted" });
  });
};
exports.create = (req, res) => {
  const form = formidable({ keepExtension: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const product = new Product(fields);
    if (files.photo) {
      if (files.photo.size > 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "image size cannot be more than 1MB " });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, product) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }
      res.json({ product });
    });
  });
};

exports.maxPrice = (req, res) => {
  Product.findOne({}, "price")
    .select({ _id: 0, price: 1 })
    .sort("-price")

    .exec((err, maxPrice) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }

      return res.json(maxPrice);
    });
};

exports.minPrice = (req, res) => {
  Product.findOne({}, "price")
    .select({ _id: 0, price: 1 })
    .sort("price")

    .exec((err, minPrice) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) });
      }

      return res.json(minPrice);
    });
};

exports.list = (req, res) => {
  const sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  const order = req.query.order ? req.query.order : "asc";
  const limit = req.query.limit ? req.query.limit : "6";

  Product.find()
    .select("-photo")
    .sort({ [sortBy]: order })
    .populate("category")
    .limit(parseInt(limit))
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return res.json({ products });
    });
};
exports.listSearch = (req, res) => {
  const category = req.query.category ? req.query.category : "";
  const searchString = req.query.search ? req.query.search : "";
  const limit = req.query.limit ? req.query.limit : "6";
  let params = {};
  if (category && category !== "undefined") {
    params.category = category;
  }

  params.name = { $regex: searchString, $options: "i" };
  Product.find(params)
    .select("-photo")
    .populate("category")
    .limit(parseInt(limit))
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return res.json({ products });
    });
};
exports.countProducts = (req, res) => {
  Product.find().countDocuments((err, count) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    return res.json({ count });
  });
};

exports.listRelated = (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 4;
  const product = req.product;
  Product.find({ category: product.category, _id: { $ne: product.id } })
    .limit(limit)
    .populate("category", "name _id")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ products });
    });
};
exports.listCategories = (req, res) => {
  Product.distinct("category").exec((err, categories) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    res.json({ categories });
  });
};
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }
  Product.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};
exports.listBySearchOr = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 8;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        if (req.body.filters[key].length > 1) {
          findArgs[key] = { $in: [...req.body.filters[key]] };
        } else findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};
