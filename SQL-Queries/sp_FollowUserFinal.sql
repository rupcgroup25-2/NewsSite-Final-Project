USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <07.07.25>
-- Description:	<Follow a user>
-- =============================================
CREATE PROCEDURE sp_FollowUserFinal
    @FollowerId INT,
    @FollowedId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM UserFollowTableFinal WHERE FollowerId = @FollowerId AND FollowedId = @FollowedId)
    BEGIN
        RETURN 0; 
    END

    INSERT INTO UserFollowTableFinal (FollowerId, FollowedId)
    VALUES (@FollowerId, @FollowedId);

    RETURN 1;
END