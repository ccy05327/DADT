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

// question 3: gender differences in mortality by region
app.get("/api/mortality-gender-differences", async (req, res) => {
  const region = req.query.region;
  console.log(region);
  const query = `
    SELECT 
        r.RegionName,
        s.Sex,
        SUM(h.Number) AS TotalMortality
    FROM 
        HealthStatistics h
    JOIN 
        Countries c ON h.CountryID = c.CountryID
    JOIN 
        Regions r ON c.RegionID = r.RegionID
    JOIN 
        Sex s ON h.SexID = s.SexID
    WHERE 
        h.Number IS NOT NULL
        AND s.Sex IN ('Male', 'Female', 'All')
        AND r.RegionName = '${region}'
    GROUP BY 
        r.RegionName, s.Sex
    ORDER BY 
        s.Sex;
  `;
  try {
    const [results] = await db.execute(query);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
