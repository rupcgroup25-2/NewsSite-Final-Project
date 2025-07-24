CREATE TABLE DailyUserLoginsFinal (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    LoginDate DATE NOT NULL,
    LoginCount INT NOT NULL DEFAULT 1
);