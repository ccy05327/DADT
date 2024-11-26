const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const app = express();
const port = 8088;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Set up MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  database: "WHO",
  user: "root",
  password: "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const indexRoot = require("./routes/indexRoot");

app.use("/", indexRoot);

// question 1: mortality by age group by region
app.use("/api/mortality-by-age-group-region", require("./routes/indexQ1"));

// question 2: mortality by age group in regions (highlighted)
app.use("/api/mortality-by-age-group-in-regions", require("./routes/indexQ2"));

// question 3: gender differences in mortality by region
app.use("/api/mortality-gender-differences", require("./routes/indexQ3"));

// question 4: yearly mortality trend by country

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
