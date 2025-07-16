CREATE TABLE UserTagsTableFinal (
    UserId INT,
    TagId INT,
    PRIMARY KEY (UserId, TagId),
    FOREIGN KEY (UserId) REFERENCES UsersTableFinal(Id),
    FOREIGN KEY (TagId) REFERENCES TagsTableFinal(Id) ON DELETE CASCADE
);
