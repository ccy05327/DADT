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

// Route to analyze gender differences in mortality by region
app.get("/", async (req, res) => {
  const region = req.query.region; // Extract region from query parameters
  console.log(region); // Log the region for debugging

  // SQL query to calculate gender-specific mortality by region
  // Reference: Query logic assisted by ChatGPT
  const query = `
    SELECT 
        r.RegionName, -- Region name
        s.Sex, -- Gender
        SUM(h.Number) AS TotalMortality -- Total mortality for each gender
    FROM 
        HealthStatistics h
    JOIN 
        Countries c ON h.CountryID = c.CountryID -- Link countries
    JOIN 
        Regions r ON c.RegionID = r.RegionID -- Link regions
    JOIN 
        Sex s ON h.SexID = s.SexID -- Link gender
    WHERE 
        h.Number IS NOT NULL -- Exclude records with null mortality numbers
        AND s.Sex IN ('Male', 'Female', 'All') -- Include only specified genders
        AND r.RegionName = '${region}' -- Filter by user-input region
    GROUP BY 
        r.RegionName, s.Sex -- Group results by region and gender
    ORDER BY 
        s.Sex; -- Sort results by gender
  `;

  try {
    const [results] = await db.execute(query); // Execute query
    console.log(results); // Log query results
    res.json(results); // Send results as JSON response
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).send("Internal Server Error"); // Return error response
  }
});

module.exports = app; // Export app for use in other modules
