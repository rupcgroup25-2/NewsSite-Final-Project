USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<SDisable FCM Token>
-- =============================================

-- ביטול התראות (לא מחיקה)
CREATE PROCEDURE sp_DisableFCMTokenFinal
    @UserId INT
AS
BEGIN
    UPDATE FCMTokensFinal
    SET NotificationsEnabled = 0, UpdatedAt = GETDATE()
    WHERE UserId = @UserId AND IsActive = 1
END