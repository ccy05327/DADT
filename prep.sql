DROP TABLE IF EXISTS Temp;

CREATE TABLE Temp (
    RegionCode VARCHAR(10),
    RegionName VARCHAR(100),
    CountryCode VARCHAR(10),
    CountryName VARCHAR(100),
    Year INT,
    Sex VARCHAR(50),
    AgeGroup VARCHAR(50),
    AgeGroupCode VARCHAR(100),
    Number FLOAT,
    PercentageOfCauseSpecificDeaths FLOAT,
    AgeStandardizedDeathRate FLOAT,
    DeathRate FLOAT
);

D:\GitHub\DADT\data\test.csv
D:\GitHub\DADT\data\WHOMortalityDatabase_Map_Noncommunicable_Diseases.csv

-- 2024/10/15 workable but NULL for all PercentageOfCauseSpecificDeaths, AgeStandardizedDeathRate, and DeathRate --
LOAD DATA INFILE 'D:\GitHub\DADT\data\WHOMortalityDatabase_Map_Noncommunicable_Diseases.csv'
INTO TABLE Temp
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '"'
IGNORE 1 LINES
(RegionCode, RegionName, CountryCode, CountryName, Year, Sex, AgeGroupCode, AgeGroup, Number, @PercentageOfCauseSpecificDeaths, @AgeStandardizedDeathRate, @DeathRate)
SET
    PercentageOfCauseSpecificDeaths = NULLIF(@PercentageOfCauseSpecificDeaths, ''),
    AgeStandardizedDeathRate = NULLIF(@AgeStandardizedDeathRate, ''),
    DeathRate = NULLIF(@DeathRate, '');

-- 2024/11/20 workable after modifying all the properties for Temp to VARCHAR --
/home/coder/project/1-50,000.csv
LOAD DATA INFILE 'D:\GitHub\DADT\data\WHOMortalityDatabase_Map_Noncommunicable_Diseases.csv'
INTO TABLE Temp
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(RegionCode, RegionName, CountryCode, CountryName, Year, Sex, @AgeGroupCode, AgeGroup, @Number, @PercentageOfCauseSpecificDeaths, @AgeStandardizedDeathRate, @DeathRate)
SET
    AgeGroupCode = @AgeGroupCode,
    Number = NULLIF(TRIM(@Number), ''),
    PercentageOfCauseSpecificDeaths = NULLIF(TRIM(@PercentageOfCauseSpecificDeaths), ''),
    AgeStandardizedDeathRate = NULLIF(TRIM(@AgeStandardizedDeathRate), ''),
    DeathRate = NULLIF(TRIM(@DeathRate), '');


CREATE TABLE Regions (
    RegionID INT AUTO_INCREMENT PRIMARY KEY,
    RegionCode VARCHAR(50) NOT NULL,
    RegionName VARCHAR(100) NOT NULL
);

CREATE TABLE Countries (
    CountryID INT AUTO_INCREMENT PRIMARY KEY,
    CountryCode VARCHAR(50) NOT NULL,
    CountryName VARCHAR(100) NOT NULL,
    RegionID INT,
    FOREIGN KEY (RegionID) REFERENCES Regions(RegionID)
);

CREATE TABLE AgeGroups (
    AgeGroupID INT AUTO_INCREMENT PRIMARY KEY,
    AgeGroupCode VARCHAR(50) NOT NULL,
    AgeGroup VARCHAR(100) NOT NULL
);

CREATE TABLE Sex (
    SexID INT AUTO_INCREMENT PRIMARY KEY,
    Sex VARCHAR(50) NOT NULL
);

CREATE TABLE HealthStatistics (
    StatID INT AUTO_INCREMENT PRIMARY KEY,
    CountryID INT,
    Year INT,
    AgeGroupID INT,
    SexID INT,
    Number FLOAT,
    PercentageOfCauseSpecificDeaths FLOAT,
    AgeStandardizedDeathRate FLOAT,
    DeathRate FLOAT,
    FOREIGN KEY (CountryID) REFERENCES Countries(CountryID),
    FOREIGN KEY (AgeGroupID) REFERENCES AgeGroups(AgeGroupID),
    FOREIGN KEY (SexID) REFERENCES Sex(SexID)
);


INSERT INTO Regions (RegionCode, RegionName)
SELECT DISTINCT RegionCode, RegionName
FROM Temp;

INSERT INTO Countries (CountryCode, CountryName, RegionID)
SELECT DISTINCT CountryCode, CountryName, (SELECT RegionID FROM Regions WHERE RegionCode = Temp.RegionCode)
FROM Temp;

INSERT INTO AgeGroups (AgeGroup, AgeGroupCode)
SELECT DISTINCT AgeGroup, AgeGroupCode
FROM Temp;

INSERT INTO Sex (Sex)
SELECT DISTINCT Sex
FROM Temp;

INSERT INTO HealthStatistics (CountryID, Year, AgeGroupID, SexID, Number, PercentageOfCauseSpecificDeaths, AgeStandardizedDeathRate, DeathRate)
SELECT 
    (SELECT CountryID FROM Countries WHERE CountryCode = Temp.CountryCode),
    Year,
    (SELECT AgeGroupID FROM AgeGroups WHERE AgeGroup = Temp.AgeGroup),
    (SELECT SexID FROM Sex WHERE Sex = Temp.Sex),
    Number, PercentageOfCauseSpecificDeaths, AgeStandardizedDeathRate, DeathRate
FROM Temp;
