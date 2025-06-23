CREATE TABLE ReportsTableFinal (
    Id INT IDENTITY PRIMARY KEY,
    ReporterId INT NOT NULL,
    ArticleId INT NULL,
    SharedArticleId INT NULL,
    Comment NVARCHAR(500),
    ReportedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ReporterId) REFERENCES UsersTableFinal(Id),
    FOREIGN KEY (ArticleId) REFERENCES ArticlesTableFinal(Id),
    FOREIGN KEY (SharedArticleId) REFERENCES SharedArticlesTable(Id)
);