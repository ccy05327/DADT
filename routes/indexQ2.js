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

module.exports = app;
