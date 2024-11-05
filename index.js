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

// question 2: mortality by age group in high-data regions
app.get("/api/mortality-by-age-group-high-data", async (req, res) => {
  const { region, ageGroup } = req.query;

  try {
    // Fetch high-data regions based on total mortality counts
    const highDataRegionsQuery = `
            SELECT Regions.RegionName
            FROM Regions
            JOIN Countries ON Regions.RegionID = Countries.RegionID
            JOIN HealthStatistics ON Countries.CountryID = HealthStatistics.CountryID
            GROUP BY Regions.RegionName
            HAVING SUM(HealthStatistics.Number) > ?;  -- Define your threshold value
        `;
    const [highDataRegions] = await db.execute(highDataRegionsQuery, [1000000]); // Example threshold

    // If a region and age group are provided, fetch mortality data
    if (region && ageGroup) {
      const mortalityDataQuery = `
                SELECT AgeGroups.AgeGroup, SUM(HealthStatistics.Number) AS TotalMortalityCount
                FROM HealthStatistics
                JOIN Countries ON HealthStatistics.CountryID = Countries.CountryID
                JOIN Regions ON Countries.RegionID = Regions.RegionID
                JOIN AgeGroups ON HealthStatistics.AgeGroupID = AgeGroups.AgeGroupID
                WHERE Regions.RegionName = ? AND AgeGroups.AgeGroupCode BETWEEN ? AND ?
                GROUP BY AgeGroups.AgeGroup;
            `;

      const [mortalityData] = await db.execute(mortalityDataQuery, [
        region,
        ageGroup.split("-")[0],
        ageGroup.split("-")[1] || 85,
      ]);
      console.log(mortalityData);
      return res.json({ highDataRegions, mortalityData });
    }

    // Return high data regions only if no specific region/age group selected
    console.log(highDataRegions);
    return res.json({ highDataRegions });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
