require("dotenv").config();
require("express-async-errors");
// async errors

const express = require("express");
const app = express();

// middleware
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("<h1>Store API</h1><a href='/api/v1/products'>All Products</a>");
});

app.use("/api/v1/products", require("./routes/products"));

// 404 and error handler
app.use(require("./middleware/notFoundMiddlware"));
app.use(require("./middleware/errorHandler"));

// listening
const PORT = process.env.PORT || 5000;
const start = async () => {
  try {
    console.log("connecting to the db...");
    await require("mongoose").connect(process.env.MONGO_URI);
    console.log("connected to the DB...");
    app.listen(PORT, console.log("Server is listening..."));
  } catch (err) {
    console.log(err);
  }
};
start();
