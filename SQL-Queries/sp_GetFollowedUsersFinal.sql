USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <24.07.25>
-- Description:	<Get all the followers>
-- =============================================
ALTER PROCEDURE sp_GetFollowedUsersFinal
    @FollowerId INT
AS
BEGIN
    SELECT 
        U.Name,
        U.Email
    FROM 
        UserFollowTableFinal UF
    INNER JOIN 
        UsersTableFinal U ON UF.FollowedId = U.Id
    WHERE 
        UF.FollowerId = @FollowerId;
END