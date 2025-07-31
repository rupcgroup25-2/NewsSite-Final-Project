CREATE PROCEDURE sp_SaveFCMTokenNoDuplicates
    @UserId INT,
    @Token NVARCHAR(MAX),
    @DeviceType NVARCHAR(50) = 'web',
    @DeviceId NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- בדיקה אם יש כבר token זהה לאותו משתמש
    IF EXISTS (SELECT 1 FROM FCMTokens WHERE UserId = @UserId AND Token = @Token)
    BEGIN
        -- אם יש - רק נעדכן שהוא פעיל
        UPDATE FCMTokens 
        SET IsActive = 1, UpdatedAt = GETDATE()
        WHERE UserId = @UserId AND Token = @Token;
        
        PRINT 'Token already exists - updated to active';
    END
    ELSE
    BEGIN
        -- אם אין - נוסיף token חדש
        INSERT INTO FCMTokens (UserId, Token, DeviceType, DeviceId, IsActive, CreatedAt, UpdatedAt)
        VALUES (@UserId, @Token, @DeviceType, @DeviceId, 1, GETDATE(), GETDATE());
        
        PRINT 'New token added';
    END
    
    -- נחזיר את מספר הtokens הפעילים למשתמש הזה
    SELECT COUNT(*) as ActiveTokensCount 
    FROM FCMTokens 
    WHERE UserId = @UserId AND IsActive = 1;
END
