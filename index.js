const express = require("express");
const bodyParser = require("body-parser");

const db = require("./src/utils/db");
const services = require("./src/routes/services");
const errorHandler = require("./src/utils/error");
const AppError = require("./src/lib/Error");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  express.json({
    limit: "15kb",
  })
);

app.use("/api/v1/services", services);

app.use("*", (req, res, next) => {
  return next(
    new AppError(
      404,
      "not found",
      "The path is unknown, just like the future!"
    ),
    req,
    res,
    next
  );
});

app.use(errorHandler);

db.connectToServer(() => {
  app.listen(port, () =>
    console.log(`Hello world app listening on port ${port}!`)
  );
});
