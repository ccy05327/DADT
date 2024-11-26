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

// Route to analyze yearly mortality trends by country
app.get("/", async (req, res) => {
  const country = req.query.country; // Extract country from query parameters
  const startYear = req.query.startYear
    ? parseInt(req.query.startYear, 10)
    : undefined; // Parse start year
  const endYear = req.query.endYear
    ? parseInt(req.query.endYear, 10)
    : undefined; // Parse end year

  console.log(req.query); // Log query parameters
  console.log(
    "Country:",
    country,
    "Start Year:",
    startYear,
    "End Year:",
    endYear
  ); // Log parsed values

  // SQL query to calculate yearly mortality by country
  // Reference: Query logic assisted by ChatGPT
  let query = `
    SELECT 
        c.CountryName, -- Country name
        hs.Year, -- Year
        SUM(hs.Number) AS TotalMortality -- Total mortality for each year
    FROM 
        HealthStatistics hs
    JOIN 
        Countries c ON hs.CountryID = c.CountryID -- Link countries
    WHERE 
        c.CountryName = ? -- Filter by user-input country
        ${startYear ? "AND hs.Year >= ?" : ""} -- Optional filter for start year
        ${endYear ? "AND hs.Year <= ?" : ""} -- Optional filter for end year
    GROUP BY 
        c.CountryName, hs.Year -- Group results by country and year
    ORDER BY 
        hs.Year; -- Sort results by year
  `;

  const params = [country]; // Initialize query parameters
  if (startYear) params.push(startYear); // Add start year if provided
  if (endYear) params.push(endYear); // Add end year if provided

  console.log("Executing Query:", query); // Log the query
  console.log("With Params:", params); // Log query parameters

  try {
    const [results] = await db.execute(query, params); // Execute query
    console.log(results); // Log query results
    res.json(results); // Send results as JSON response
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).send("Internal Server Error"); // Return error response
  }
});

module.exports = app; // Export app for use in other modules
