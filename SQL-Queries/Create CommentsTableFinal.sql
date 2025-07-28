CREATE TABLE CommentsTableFinal (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ArticleId INT NOT NULL,
    UserId INT NOT NULL,
    CommentText NVARCHAR(500) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (ArticleId) REFERENCES ArticlesTableFinal(Id),
    FOREIGN KEY (UserId) REFERENCES UsersTableFinal(Id)
);
