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

app.get("/", async (req, res) => {
  try {
    const [regions] = await db.query("SELECT DISTINCT RegionName FROM Regions");
    const [countries] = await db.query(
      "SELECT DISTINCT CountryName FROM Countries"
    );
    const [ageGroups] = await db.query(
      "SELECT DISTINCT AgeGroup FROM AgeGroups"
    );
    const [sexOptions] = await db.query("SELECT DISTINCT Sex FROM Sex");
    res.render("home", { regions, countries, ageGroups, sexOptions });
    // res.render("chart");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// question 1: mortality by age group by region
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

// question 2: mortality by age group in regions (highlighted)
app.get("/api/mortality-by-age-group-in-regions", async (req, res) => {
  const { region, ageGroup } = req.query;
  console.log(region, ageGroup);
    // const query = `
    //     SELECT 
    //         CASE 
    //             WHEN AgeGroups.AgeGroupCode < 10 THEN '0-9'
    //             WHEN AgeGroups.AgeGroupCode < 20 THEN '10-19'
    //             WHEN AgeGroups.AgeGroupCode < 30 THEN '20-29'
    //             WHEN AgeGroups.AgeGroupCode < 40 THEN '30-39'
    //             WHEN AgeGroups.AgeGroupCode < 50 THEN '40-49'
    //             WHEN AgeGroups.AgeGroupCode < 60 THEN '50-59'
    //             WHEN AgeGroups.AgeGroupCode < 70 THEN '60-69'
    //             WHEN AgeGroups.AgeGroupCode < 80 THEN '70-79'
    //             ELSE '80+'
    //         END AS AgeGroup,
    //         SUM(HealthStatistics.Number) AS TotalMortalityCount
    //     FROM HealthStatistics
    //     JOIN Countries ON HealthStatistics.CountryID = Countries.CountryID
    //     JOIN Regions ON Countries.RegionID = Regions.RegionID
    //     JOIN AgeGroups ON HealthStatistics.AgeGroupID = AgeGroups.AgeGroupID
    //     WHERE Regions.RegionName = ? 
    //         AND AgeGroups.AgeGroup NOT IN ('[All]', '[Unknown]')
    //         AND ${ageRangeCondition}
    //     GROUP BY AgeGroup
    //     ORDER BY MIN(AgeGroups.AgeGroupCode)
    // `;

  const query = `
    SELECT 
        CASE 
            WHEN ag.AgeGroupCode BETWEEN 0 AND 9 THEN '0-9'
            WHEN ag.AgeGroupCode BETWEEN 10 AND 19 THEN '10-19'
            WHEN ag.AgeGroupCode BETWEEN 20 AND 29 THEN '20-29'
            WHEN ag.AgeGroupCode BETWEEN 30 AND 39 THEN '30-39'
            WHEN ag.AgeGroupCode BETWEEN 40 AND 49 THEN '40-49'
            WHEN ag.AgeGroupCode BETWEEN 50 AND 59 THEN '50-59'
            WHEN ag.AgeGroupCode BETWEEN 60 AND 69 THEN '60-69'
            WHEN ag.AgeGroupCode BETWEEN 70 AND 79 THEN '70-79'
            ELSE '80+'
        END AS AgeRange,
        r.RegionName,
        SUM(hs.Number) AS TotalMortality
    FROM HealthStatistics hs
    JOIN AgeGroups ag ON hs.AgeGroupID = ag.AgeGroupID
    JOIN Countries c ON hs.CountryID = c.CountryID
    JOIN Regions r ON c.RegionID = r.RegionID
    WHERE ag.AgeGroup NOT IN ('[All]', '[Unknown]')
    AND (
      CASE 
          WHEN ag.AgeGroupCode BETWEEN 0 AND 9 THEN '0-9'
          WHEN ag.AgeGroupCode BETWEEN 10 AND 19 THEN '10-19'
          WHEN ag.AgeGroupCode BETWEEN 20 AND 29 THEN '20-29'
          WHEN ag.AgeGroupCode BETWEEN 30 AND 39 THEN '30-39'
          WHEN ag.AgeGroupCode BETWEEN 40 AND 49 THEN '40-49'
          WHEN ag.AgeGroupCode BETWEEN 50 AND 59 THEN '50-59'
          WHEN ag.AgeGroupCode BETWEEN 60 AND 69 THEN '60-69'
          WHEN ag.AgeGroupCode BETWEEN 70 AND 79 THEN '70-79'
          ELSE '80+'
      END = '${ageGroup}'
  )  -- Replace '?' with user input for filtering
    GROUP BY AgeRange, r.RegionName
    ORDER BY AgeRange ASC, r.RegionName
  `;

    try {
      const [results] = await db.execute(query, [region]);
      console.log(results);
      res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// question 3: gender differences in mortality by region
app.get("/api/mortality-

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
