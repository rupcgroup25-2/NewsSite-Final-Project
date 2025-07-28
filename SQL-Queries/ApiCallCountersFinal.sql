CREATE TABLE ApiCallCountersFinal (
    CounterName NVARCHAR(100) PRIMARY KEY,
    CounterValue INT NOT NULL DEFAULT 0
);
INSERT INTO ApiCallCountersFinal (CounterName, CounterValue)
VALUES ('NewsApiCalls', 0);