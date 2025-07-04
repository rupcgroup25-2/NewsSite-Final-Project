USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <04.07.25>
-- Description:	<Get BlockSharing status>
-- =============================================
CREATE PROCEDURE sp_GetUserBlockSharingFinal
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT BlockSharing
    FROM UsersTableFinal
    WHERE Id = @UserId;
END