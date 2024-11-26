const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const db = mysql.createPool({
  host: "localhost",
  database: "WHO",
  user: "root",
  password: "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// question 4: yearly mortality trend by country
app.get("/api/yearly-mortality-by-country", async (req, res) => {
  const country = req.query.country;
  const startYear = req.query.startYear
    ? parseInt(req.query.startYear, 10)
    : undefined;
  const endYear = req.query.endYear
    ? parseInt(req.query.endYear, 10)
    : undefined;

  console.log(req.query);
  console.log(
    "Country:",
    country,
    "Start Year:",
    startYear,
    "End Year:",
    endYear
  );

  let query = `
    SELECT 
        c.CountryName, 
        hs.Year, 
        SUM(hs.Number) AS TotalMortality
    FROM 
        HealthStatistics hs
    JOIN 
        Countries c ON hs.CountryID = c.CountryID
    WHERE 
        c.CountryName = ?
        ${startYear ? "AND hs.Year >= ?" : ""}
        ${endYear ? "AND hs.Year <= ?" : ""}
    GROUP BY 
        c.CountryName, hs.Year
    ORDER BY 
        hs.Year;
  `;

  const params = [country];
  if (startYear) params.push(startYear);
  if (endYear) params.push(endYear);

  console.log("Executing Query:", query);
  console.log("With Params:", params);

  try {
    const [results] = await db.execute(query, params);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
