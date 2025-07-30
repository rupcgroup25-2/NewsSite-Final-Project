CREATE TABLE FCMTokensFinal (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    FCMToken NVARCHAR(500) NOT NULL,
    DeviceType NVARCHAR(50) DEFAULT 'web',
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (UserId) REFERENCES UsersTableFinal(Id),
    UNIQUE(UserId, FCMToken)
);

-- אינדקס לחיפוש מהיר
CREATE INDEX IX_FCMTokens_UserId ON FCMTokensFinal(UserId);
CREATE INDEX IX_FCMTokens_IsActive ON FCMTokensFinal(IsActive);
CREATE INDEX IX_FCMTokens_NotificationsEnabled ON FCMTokensFinal(NotificationsEnabled);
ALTER TABLE FCMTokensFinal ADD NotificationsEnabled BIT DEFAULT 1;
