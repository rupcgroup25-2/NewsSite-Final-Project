USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<Get user followers with notifications enabled>
-- =============================================

CREATE PROCEDURE sp_GetUserFollowersFinal
    @UserId INT
AS
BEGIN
    SELECT DISTINCT f.FollowerId
    FROM UserFollowTableFinal f
    INNER JOIN FCMTokensFinal ft ON f.FollowerId = ft.UserId
    WHERE f.FollowedId = @UserId 
      AND ft.IsActive = 1 
      AND ft.NotificationsEnabled = 1
END
