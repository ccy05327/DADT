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
    const [Q4countries] = await db.query(
      "SELECT c.CountryName, COUNT(DISTINCT hs.Year) AS YearCoverage \
      FROM Countries c \
      JOIN HealthStatistics hs ON c.CountryID = hs.CountryID \
      GROUP BY c.CountryName \
      ORDER BY YearCoverage DESC \
      LIMIT 15"
    );
    const [ageGroups] = await db.query(
      "SELECT DISTINCT AgeGroup FROM AgeGroups"
    );
    const [sexOptions] = await db.query("SELECT DISTINCT Sex FROM Sex");
    const [yearOptions] = await db.query(
      "SELECT DISTINCT Year FROM HealthStatistics ORDER BY Year"
    );
    res.render("home", {
      regions,
      countries,
      ageGroups,
      sexOptions,
      Q4countries,
      yearOptions,
    });
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
        END AS AgeRange,
        SUM(HealthStatistics.Number) AS TotalMortalityCount
    FROM HealthStatistics
    JOIN Countries ON HealthStatistics.CountryID = Countries.CountryID
    JOIN Regions ON Countries.RegionID = Regions.RegionID
    JOIN AgeGroups ON HealthStatistics.AgeGroupID = AgeGroups.AgeGroupID
    WHERE Regions.RegionName = '${selectedRegion}'
      AND AgeGroups.AgeGroup <> '[All]'
      AND AgeGroups.AgeGroup <> '[Unknown]'
    GROUP BY AgeRange
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
        END = '${ageGroup}'  -- Replace with user input for filtering
    )
    GROUP BY AgeRange, r.RegionName
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
        END ASC, r.RegionName;
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
