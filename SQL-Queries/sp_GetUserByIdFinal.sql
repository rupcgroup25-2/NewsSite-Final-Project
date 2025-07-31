USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<Get user by id >
-- =============================================
CREATE PROCEDURE sp_GetUserByIdFinal
    @userId INT
AS
BEGIN
    SELECT Id, Name, Email, Password, Active, BlockSharing
    FROM UsersTableFinal 
    WHERE Id = @userId AND Active = 1
END