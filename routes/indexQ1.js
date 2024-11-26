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

// question 1: mortality by age group by region
app.get("/", async (req, res) => {
  const selectedRegion = req.query.region; // Get region from query params
  console.log(selectedRegion); // Log the selected region
  if (!selectedRegion) {
    return res.status(400).json({ error: "No region selected." }); // Handle missing region
  }

  // SQL query to group age ranges and calculate total mortality for the selected region
  // Reference: Query structure assisted by ChatGPT
  const query = `
    SELECT 
        CASE 
            WHEN AgeGroups.AgeGroup IN ('[0]') THEN '0-9'
            WHEN AgeGroups.AgeGroup IN ('[1-4]', '[5-9]') THEN '0-9'
            WHEN AgeGroups.AgeGroup IN ('[10-14]', '[15-19]') THEN '10-19'
            WHEN AgeGroups.AgeGroup IN ('[20-24]', '[25-29]') THEN '20-29'
            WHEN AgeGroups.AgeGroup IN ('[30-34]', '[35-39]') THEN '30-39'
            WHEN AgeGroups.AgeGroup IN ('[40-44]', '[45-49]') THEN '40-49'
            WHEN AgeGroups.AgeGroup IN ('[50-54]', '[55-59]') THEN '50-59'
            WHEN AgeGroups.AgeGroup IN ('[60-64]', '[65-69]') THEN '60-69'
            WHEN AgeGroups.AgeGroup IN ('[70-74]', '[75-79]') THEN '70-79'
            WHEN AgeGroups.AgeGroup IN ('[80-84]', '[85+]') THEN '80+'
        END AS AgeRange -- Map specific age groups to broader ranges
        , SUM(HealthStatistics.Number) AS TotalMortalityCount -- Sum mortality numbers
    FROM HealthStatistics
    JOIN Countries ON HealthStatistics.CountryID = Countries.CountryID -- Link countries
    JOIN Regions ON Countries.RegionID = Regions.RegionID -- Link regions
    JOIN AgeGroups ON HealthStatistics.AgeGroupID = AgeGroups.AgeGroupID -- Link age groups
    WHERE Regions.RegionName = '${selectedRegion}' -- Filter by selected region
      AND AgeGroups.AgeGroup <> '[All]' -- Exclude summary data
      AND AgeGroups.AgeGroup <> '[Unknown]' -- Exclude unknown groups
    GROUP BY AgeRange -- Group results by age range
    ORDER BY 
        CASE 
            WHEN AgeRange = '0-9' THEN 1
            WHEN AgeRange = '10-19' THEN 2
            WHEN AgeRange = '20-29' THEN 3
            WHEN AgeRange = '30-39' THEN 4
            WHEN AgeRange = '40-49' THEN 5
            WHEN AgeRange = '50-59' THEN 6
            WHEN AgeRange = '60-69' THEN 7
            WHEN AgeRange = '70-79' THEN 8
            WHEN AgeRange = '80+' THEN 9
        END; -- Ensure age ranges are ordered logically
  `;

  try {
    const [results] = await db.execute(query, [selectedRegion]); // Execute the query
    console.log(results); // Log query results
    res.json(results); // Send results as JSON
  } catch (error) {
    console.error(error); // Log errors
    res.status(500).send("Internal Server Error"); // Handle server errors
  }
});

module.exports = app;
