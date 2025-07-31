USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<Enable FCM Token>
-- =============================================

-- הפעלת התראות
alter PROCEDURE sp_EnableFCMTokenFinal
    @UserId INT
AS
BEGIN
    UPDATE FCMTokensFinal 
    SET NotificationsEnabled = 1, UpdatedAt = GETDATE()
    WHERE UserId = @UserId AND IsActive = 1
END
