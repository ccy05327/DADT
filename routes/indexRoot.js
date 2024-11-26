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

app.get("/", async (req, res) => {
  try {
    // basic info
    const [totalRecords] = await db.execute(
      "SELECT COUNT(*) AS TotalRecords FROM HealthStatistics;"
    );
    const [totalCountries] = await db.execute(
      "SELECT COUNT(DISTINCT CountryID) AS TotalCountries FROM HealthStatistics;"
    );
    const [totalYears] = await db.execute(
      "SELECT COUNT(DISTINCT Year) AS TotalYears FROM HealthStatistics;"
    );
    const [totalAgeGroups] = await db.execute(
      "SELECT COUNT(DISTINCT AgeGroupID) AS TotalAgeGroups FROM HealthStatistics;"
    );
    const [totalSexCategories] = await db.execute(
      "SELECT COUNT(DISTINCT SexID) AS TotalSexCategories FROM HealthStatistics;"
    );

    const [totalMortality] = await db.execute(
      "SELECT SUM(Number) AS TotalMortality FROM HealthStatistics;"
    );
    const [avgMortalityPerYear] = await db.execute(
      "SELECT AVG(Number) AS AvgMortalityPerYear FROM HealthStatistics;"
    );
    const [maxMortality] = await db.execute(
      "SELECT MAX(Number) AS MaxMortality FROM HealthStatistics;"
    );
    const [minMortality] = await db.execute(
      "SELECT MIN(Number) AS MinMortality FROM HealthStatistics;"
    );
    const [avgDeathRate] = await db.query(
      "SELECT AVG(DeathRate) AS AvgDeathRate FROM HealthStatistics"
    );

    const [maxDeathRate] = await db.query(
      "SELECT MAX(DeathRate) AS MaxDeathRate FROM HealthStatistics"
    );
    const [minDeathRate] = await db.query(
      "SELECT MIN(DeathRate) AS MinDeathRate FROM HealthStatistics"
    );
    const [avgCauseSpecific] = await db.query(
      "SELECT AVG(PercentageOfCauseSpecificDeaths) AS AvgCauseSpecific FROM HealthStatistics"
    );
    const [maxCauseSpecific] = await db.query(
      "SELECT MAX(PercentageOfCauseSpecificDeaths) AS MaxCauseSpecific FROM HealthStatistics"
    );
    const [earliestYear] = await db.query(
      "SELECT MIN(Year) AS EarliestYear FROM HealthStatistics"
    );

    const [latestYear] = await db.query(
      "SELECT MAX(Year) AS LatestYear FROM HealthStatistics"
    );
    const [percentMissingMortality] = await db.query(
      "SELECT (COUNT(*) * 100 / (SELECT COUNT(*) FROM HealthStatistics)) AS PercentMissingMortality FROM HealthStatistics WHERE Number IS NULL"
    );
    const [percentMissingDeathRate] = await db.query(
      "SELECT (COUNT(*) * 100 / (SELECT COUNT(*) FROM HealthStatistics)) AS PercentMissingDeathRate FROM HealthStatistics WHERE DeathRate IS NULL"
    );
    const [countriesWithCompleteData] = await db.query(
      "SELECT COUNT(*) AS CountryCount FROM Countries c WHERE NOT EXISTS (SELECT 1 FROM HealthStatistics hs WHERE hs.CountryID = c.CountryID AND hs.Number IS NULL)"
    );
    const [regionWithMostMortalityData] = await db.query(
      "SELECT r.RegionName, COUNT(*) AS Records FROM HealthStatistics hs JOIN Countries c ON hs.CountryID = c.CountryID JOIN Regions r ON c.RegionID = r.RegionID GROUP BY r.RegionName ORDER BY Records DESC LIMIT 1"
    );
    const [countryWithHighestTotalMortality] = await db.query(
      "SELECT c.CountryName, SUM(hs.Number) AS TotalMortality FROM HealthStatistics hs JOIN Countries c ON hs.CountryID = c.CountryID GROUP BY c.CountryName ORDER BY TotalMortality DESC LIMIT 1"
    );

    // query for charts
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
      stats: {
        totalRecords: totalRecords[0].TotalRecords,
        totalCountries: totalCountries[0].TotalCountries,
        totalYears: totalYears[0].TotalYears,
        totalAgeGroups: totalAgeGroups[0].TotalAgeGroups,
        totalSexCategories: totalSexCategories[0].TotalSexCategories,
        totalMortality: totalMortality[0].TotalMortality,
        avgMortalityPerYear: avgMortalityPerYear[0].AvgMortalityPerYear,
        maxMortality: maxMortality[0].MaxMortality,
        minMortality: minMortality[0].MinMortality,
        avgDeathRate: avgDeathRate[0].AvgDeathRate,
        maxDeathRate: maxDeathRate[0].MaxDeathRate,
        minDeathRate: minDeathRate[0].MinDeathRate,
        avgCauseSpecific: avgCauseSpecific[0].AvgCauseSpecific,
        maxCauseSpecific: maxCauseSpecific[0].MaxCauseSpecific,
        earliestYear: earliestYear[0].EarliestYear,
        latestYear: latestYear[0].LatestYear,
        percentMissingMortality:
          percentMissingMortality[0].PercentMissingMortality,
        percentMissingDeathRate:
          percentMissingDeathRate[0].PercentMissingDeathRate,
        countriesWithCompleteData: countriesWithCompleteData[0].CountryCount,
        regionWithMostMortalityData: regionWithMostMortalityData[0].RegionName,
        countryWithHighestTotalMortality:
          countryWithHighestTotalMortality[0].CountryName,
      },
    });
    // res.render("chart");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
