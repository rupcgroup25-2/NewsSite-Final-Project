USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <07.07.25>
-- Description:	<Unfollow User>
-- =============================================
CREATE PROCEDURE [dbo].[sp_UnfollowUserFinal]
    @FollowerId INT,
    @FollowedId INT
AS
BEGIN
    DELETE FROM UserFollowTableFinal
    WHERE FollowerId = @FollowerId AND FollowedId = @FollowedId
END