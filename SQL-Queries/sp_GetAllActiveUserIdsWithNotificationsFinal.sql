USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<Get All Active UserIds With Notifications>
-- =============================================

-- קבלת כל המשתמשים הפעילים עם התראות
CREATE PROCEDURE sp_GetAllActiveUserIdsWithNotificationsFinal
AS
BEGIN
    SELECT DISTINCT UserId
    FROM FCMTokensFinal
    WHERE IsActive = 1 AND NotificationsEnabled = 1
END
