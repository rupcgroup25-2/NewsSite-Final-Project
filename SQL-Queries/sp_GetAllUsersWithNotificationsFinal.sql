USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<Get admin users with notifications enabled>
-- =============================================
CREATE PROCEDURE sp_GetAllUsersWithNotificationsFinal
AS
BEGIN
    SELECT DISTINCT u.Id
    FROM UsersTableFinal u
    INNER JOIN FCMTokensFinal ft ON u.Id = ft.UserId
    WHERE ft.IsActive = 1 
      AND ft.NotificationsEnabled = 1
      AND u.Email = 'admin@newshub.com'  -- רק אדמין יקבל התראות דיווחים
END