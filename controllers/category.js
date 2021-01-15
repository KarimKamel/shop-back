const Category = require("../models/category");
const { errorHandler, buildError } = require("../helpers/dbErrorHandler");
const { json } = require("express");
exports.create = (req, res) => {
  const category = new Category(req.body);
  category.save((err, category) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
    res.json({ category });
  });
};
exports.read = function (req, res, next) {
  res.json({ category: req.category });
};

exports.update = function (req, res, next) {
  const category = req.category;
  if (!req.body.name)
    return res.status(400).json({ error: "name is required" });
  Object.assign(category, req.body);
  category.save((err, category) => {
    if (err) {
      return res.status(400).json({
        error: err.message,
      });
    }
    return res.json({ category });
  });
};
exports.findCategoryById = (req, res, next, id) => {
  Category.findById(id, (err, category) => {
    if (err || !category) {
      res.status(400).json({
        error: "category not found",
      });
    } else {
      req.category = category;
      next();
    }
  });
};
exports.remove = (req, res, next) => {
  Category.deleteOne({ _id: req.category.id }, (err, category) => {
    if (err || !category) {
      res.status(400).json({
        error: "category not found",
      });
    } else {
      res.json({ message: "category deleted" });
    }
  });
};

exports.list = (req, res, next) => {
  Category.find({}, (err, categories) => {
    if (err) {
      json.status(400).json({ err: "could not retrieve category list" });
    }

    res.json({ categories: categories.map(c => c) });
  });
};
