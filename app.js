var gzippo = require("gzippo");
var express = require("express");
var logger = require("morgan");
var app = express();
var cors = require("cors");
app.use(cors());
app.use(logger("dev")); //app.use(express.logger('dev'));
app.use(gzippo.staticGzip("" + __dirname + "/build"));
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(process.env.PORT || 5000);
