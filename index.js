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
  password: "0327",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/", async (req, res) => {
  try {
    const regions = [
      "Europe",
      "North America and the Caribbean",
      "Central and South America",
      "Asia",
      "Oceania",
      "Africa",
    ];
    const countries = [
      "Albania",
      "Antigua and Barbuda",
      "Argentina",
      "Armenia",
      "Australia",
      "Austria",
      "Azerbaijan",
      "Bahamas",
      "Bahrain",
      "Barbados",
      "Belarus",
      "Belgium",
      "Belize",
      "Bosnia and Herzegovina",
      "Brazil",
      "Brunei Darussalam",
      "Bulgaria",
      "Cabo Verde",
      "Canada",
      "Chile",
      "Colombia",
      "Costa Rica",
      "Croatia",
      "Cuba",
      "Cyprus",
      "Czechia",
      "Denmark",
      "Dominica",
      "Dominican Republic",
      "Ecuador",
      "Egypt",
      "El Salvador",
      "Estonia",
      "Fiji",
      "Finland",
      "France",
      "French Guiana",
      "Georgia",
      "Germany",
      "Greece",
      "Grenada",
      "Guadeloupe",
      "Guatemala",
      "Guyana",
      "China, Hong Kong SAR",
      "Hungary",
      "Iceland",
      "Iran (Islamic Republic of)",
      "Iraq",
      "Ireland",
      "Israel",
      "Italy",
      "Jamaica",
      "Japan",
      "Kazakhstan",
      "Republic of Korea",
      "Kuwait",
      "Kyrgyzstan",
      "Latvia",
      "Lithuania",
      "Luxembourg",
      "Maldives",
      "Malta",
      "Martinique",
      "Mauritius",
      "Mayotte",
      "Mexico",
      "Republic of Moldova",
      "Mongolia",
      "Montenegro",
      "Netherlands",
      "New Zealand",
      "Nicaragua",
      "North Macedonia",
      "Norway",
      "Panama",
      "Paraguay",
      "Peru",
      "Philippines",
      "Poland",
      "Portugal",
      "Puerto Rico",
      "R?union",
      "Romania",
      "Russian Federation",
      "Saint Kitts and Nevis",
      "Saint Lucia",
      "Saint Vincent and the Grenadines",
      "Sao Tome and Principe",
      "Serbia",
      "Seychelles",
      "Singapore",
      "Slovakia",
      "Slovenia",
      "South Africa",
      "Spain",
      "Sri Lanka",
      "Suriname",
      "Sweden",
      "Switzerland",
      "Syrian Arab Republic",
      "Tajikistan",
      "Thailand",
      "Trinidad and Tobago",
      "T?rkiye",
      "Turkmenistan",
      "Ukraine",
      "United Kingdom of Great Britain and Northern Ireland",
      "United States of America",
      "Uruguay",
      "Uzbekistan",
      "Venezuela (Bolivarian Republic of)",
      "Jordan",
      "United Arab Emirates",
      "Lebanon",
      "Malaysia",
      "Oman",
      "Qatar",
      "Saudi Arabia",
    ];
    const ageGroups = [
      "[85+]",
      "[80-84]",
      "[75-79]",
      "[70-74]",
      "[65-69]",
      "[60-64]",
      "[55-59]",
      "[50-54]",
      "[45-49]",
      "[40-44]",
      "[35-39]",
      "[30-34]",
      "[25-29]",
      "[20-24]",
      "[15-19]",
      "[10-14]",
      "[5-9]",
      "[1-4]",
      "[0]",
      "[All]",
      "[Unknown]",
    ];
    const sexOptions = ["All", "Male", "Female", "Unknown"];

    res.render("home", { regions, countries, ageGroups, sexOptions });
    // res.render("chart");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/mortality-by-age-group-region", async (req, res) => {
  const selectedRegion = req.query.region;
  console.log(selectedRegion);
  if (!selectedRegion) {
    return res.status(400).json({ error: "No region selected." });
  }

  // workable original data
  // const query = `
  //     SELECT AgeGroups.AgeGroup, SUM(HealthStatistics.Number) AS TotalMortalityCount
  //     FROM HealthStatistics
  //     JOIN Countries ON HealthStatistics.CountryID = Countries.CountryID
  //     JOIN Regions ON Countries.RegionID = Regions.RegionID
  //     JOIN AgeGroups ON HealthStatistics.AgeGroupID = AgeGroups.AgeGroupID
  //     WHERE Regions.RegionName = ? AND AgeGroups.AgeGroup <> '[All]' AND AgeGroups.AgeGroup <> '[Unknown]'
  //     GROUP BY AgeGroups.AgeGroup
  // `;

  const query = `
    SELECT 
        CASE 
            WHEN AgeGroups.AgeGroupCode BETWEEN 0 AND 9 THEN '0-9'
            WHEN AgeGroups.AgeGroupCode BETWEEN 10 AND 19 THEN '10-19'
            WHEN AgeGroups.AgeGroupCode BETWEEN 20 AND 29 THEN '20-29'
            WHEN AgeGroups.AgeGroupCode BETWEEN 30 AND 39 THEN '30-39'
            WHEN AgeGroups.AgeGroupCode BETWEEN 40 AND 49 THEN '40-49'
            WHEN AgeGroups.AgeGroupCode BETWEEN 50 AND 59 THEN '50-59'
            WHEN AgeGroups.AgeGroupCode BETWEEN 60 AND 69 THEN '60-69'
            WHEN AgeGroups.AgeGroupCode BETWEEN 70 AND 79 THEN '70-79'
            WHEN AgeGroups.AgeGroupCode >= 80 THEN '80+'
        END AS AgeRange,
        SUM(HealthStatistics.Number) AS TotalMortalityCount
    FROM HealthStatistics
    JOIN Countries ON HealthStatistics.CountryID = Countries.CountryID
    JOIN Regions ON Countries.RegionID = Regions.RegionID
    JOIN AgeGroups ON HealthStatistics.AgeGroupID = AgeGroups.AgeGroupID
    WHERE Regions.RegionName = ? 
      AND AgeGroups.AgeGroup <> '[All]' 
      AND AgeGroups.AgeGroup <> '[Unknown]'
    GROUP BY AgeRange
    ORDER BY 
        CASE AgeRange
            WHEN '0-9' THEN 1
            WHEN '10-19' THEN 2
            WHEN '20-29' THEN 3
            WHEN '30-39' THEN 4
            WHEN '40-49' THEN 5
            WHEN '50-59' THEN 6
            WHEN '60-69' THEN 7
            WHEN '70-79' THEN 8
            WHEN '80+' THEN 9
        END;
`;

  try {
    const [results] = await db.execute(query, [selectedRegion]);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
