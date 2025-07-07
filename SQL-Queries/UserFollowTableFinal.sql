CREATE TABLE UserFollowTableFinal (
    FollowerId INT NOT NULL, 
    FollowedId INT NOT NULL,  
    FollowedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (FollowerId, FollowedId),
    FOREIGN KEY (FollowerId) REFERENCES UsersTableFinal(Id),
    FOREIGN KEY (FollowedId) REFERENCES UsersTableFinal(Id)
);