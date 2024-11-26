const express = require("express");
const mysql = require("mysql2/promise");
const app = express();

// Configure MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  database: "WHO",
  user: "root",
  password: "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Route to analyze mortality by age group in regions
app.get("/", async (req, res) => {
  const { region, ageGroup } = req.query; // Extract region and age group from query params
  console.log(region, ageGroup); // Log inputs for debugging

  // SQL query for grouping age ranges and calculating mortality by region
  // Reference: Query structure assisted by ChatGPT
  const query = `
    SELECT 
        CASE 
            WHEN ag.AgeGroup IN ('[0]') THEN '0-9'
            WHEN ag.AgeGroup IN ('[1-4]', '[5-9]') THEN '0-9'
            WHEN ag.AgeGroup IN ('[10-14]', '[15-19]') THEN '10-19'
            WHEN ag.AgeGroup IN ('[20-24]', '[25-29]') THEN '20-29'
            WHEN ag.AgeGroup IN ('[30-34]', '[35-39]') THEN '30-39'
            WHEN ag.AgeGroup IN ('[40-44]', '[45-49]') THEN '40-49'
            WHEN ag.AgeGroup IN ('[50-54]', '[55-59]') THEN '50-59'
            WHEN ag.AgeGroup IN ('[60-64]', '[65-69]') THEN '60-69'
            WHEN ag.AgeGroup IN ('[70-74]', '[75-79]') THEN '70-79'
            WHEN ag.AgeGroup IN ('[80-84]', '[85+]') THEN '80+'
        END AS AgeRange, -- Map specific age groups to broader ranges
        r.RegionName, -- Include region names in results
        SUM(hs.Number) AS TotalMortality -- Sum mortality numbers
    FROM HealthStatistics hs
    JOIN AgeGroups ag ON hs.AgeGroupID = ag.AgeGroupID -- Link age groups
    JOIN Countries c ON hs.CountryID = c.CountryID -- Link countries
    JOIN Regions r ON c.RegionID = r.RegionID -- Link regions
    WHERE ag.AgeGroup NOT IN ('[All]', '[Unknown]') -- Exclude summary and unknown data
    AND (
        CASE 
            WHEN ag.AgeGroup IN ('[0]') THEN '0-9'
            WHEN ag.AgeGroup IN ('[1-4]', '[5-9]') THEN '0-9'
            WHEN ag.AgeGroup IN ('[10-14]', '[15-19]') THEN '10-19'
            WHEN ag.AgeGroup IN ('[20-24]', '[25-29]') THEN '20-29'
            WHEN ag.AgeGroup IN ('[30-34]', '[35-39]') THEN '30-39'
            WHEN ag.AgeGroup IN ('[40-44]', '[45-49]') THEN '40-49'
            WHEN ag.AgeGroup IN ('[50-54]', '[55-59]') THEN '50-59'
            WHEN ag.AgeGroup IN ('[60-64]', '[65-69]') THEN '60-69'
            WHEN ag.AgeGroup IN ('[70-74]', '[75-79]') THEN '70-79'
            WHEN ag.AgeGroup IN ('[80-84]', '[85+]') THEN '80+'
        END = '${ageGroup}' -- Filter results by age group
    )
    GROUP BY AgeRange, r.RegionName -- Group by age range and region
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
        END ASC, r.RegionName; -- Order logically by age range and region name
  `;

  try {
    const [results] = await db.execute(query, [region]); // Execute query with region parameter
    console.log(results); // Log query results
    res.json(results); // Send results as JSON
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).send("Internal Server Error"); // Send error response
  }
});

module.exports = app; // Export app for use in other modules
