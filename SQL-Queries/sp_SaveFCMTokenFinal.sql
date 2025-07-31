USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<Save fcm token>
-- =============================================

-- שמירת FCM Token
CREATE PROCEDURE sp_SaveFCMTokenFinal
    @UserId INT,
    @FCMToken NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- בדוק אם הטוקן כבר קיים לאותו משתמש
    IF EXISTS (SELECT 1 FROM FCMTokensFinal WHERE UserId = @UserId AND FCMToken = @FCMToken)
    BEGIN
        -- אם קיים, רק עדכן את הזמנים והסטטוס
        UPDATE FCMTokensFinal 
        SET IsActive = 1, 
            NotificationsEnabled = 1, 
            UpdatedAt = GETDATE()
        WHERE UserId = @UserId AND FCMToken = @FCMToken;
        
        PRINT 'FCM Token updated for existing record';
    END
    ELSE
    BEGIN
        -- אם לא קיים, נסה להוסיף רשומה חדשה
        BEGIN TRY
            INSERT INTO FCMTokensFinal (UserId, FCMToken, IsActive, NotificationsEnabled, CreatedAt, UpdatedAt)
            VALUES (@UserId, @FCMToken, 1, 1, GETDATE(), GETDATE());
            
            PRINT 'New FCM Token inserted successfully';
        END TRY
        BEGIN CATCH
            -- אם יש שגיאה (כמו UNIQUE constraint), נסה לעדכן
            UPDATE FCMTokensFinal 
            SET IsActive = 1, 
                NotificationsEnabled = 1, 
                UpdatedAt = GETDATE()
            WHERE UserId = @UserId AND FCMToken = @FCMToken;
            
            PRINT 'FCM Token updated after constraint conflict';
        END CATCH
    END
END
