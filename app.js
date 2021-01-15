const express = require("express");
const { authRoutes } = require("./routes/auth");
const { userRoutes } = require("./routes/user");
const { categoryRoutes } = require("./routes/category");
const { productRoutes } = require("./routes/product");
const mongoose = require("mongoose");
const morgan = require("morgan");

var cors = require("cors");
var cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

const mongoUri = process.env.MONGO_URI;
async function connectDb() {
  const client = await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });

  return client;
}

app.use(morgan("dev"));
app.use(cors({ credentials: true }));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
// app.use(expressValidator());
app.get("/", (req, res) => {
  console.log("welcome");
  res.send("welcome");
});
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
// app.use(function (err, req, res, next) {
//   if (err.name === "UnauthorizedError") {
//     res.status(401).send("invalid token...");
//   }
// });
connectDb();
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

connectDb().then();
