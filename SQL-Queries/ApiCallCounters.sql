CREATE TABLE ApiCallCounters (
    CounterName NVARCHAR(100) PRIMARY KEY,
    CounterValue INT NOT NULL DEFAULT 0
);
INSERT INTO ApiCallCounters (CounterName, CounterValue)
VALUES ('NewsApiCalls', 0);