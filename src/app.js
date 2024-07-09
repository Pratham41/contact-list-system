const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;