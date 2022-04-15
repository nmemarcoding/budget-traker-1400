const express = require("express");
const compression = require("compression");
const mongoose = require("mongoose");
const logger = require("morgan");

const url = ""
const PORT = process.env.PORT || 3001;
const MONGODB_URI = url || "mongodb://localhost/budget";

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false
});

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});