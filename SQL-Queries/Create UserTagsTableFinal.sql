CREATE TABLE UserTagsTableFinal (
    UserId INT,
    TagId INT,
	CreatedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (UserId, TagId),
    FOREIGN KEY (UserId) REFERENCES UsersTableFinal(Id),
    FOREIGN KEY (TagId) REFERENCES TagsTableFinal(Id) ON DELETE CASCADE
);
