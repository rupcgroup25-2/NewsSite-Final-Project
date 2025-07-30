USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<Get user by email>
-- =============================================
CREATE PROCEDURE sp_GetUserByEmailFinal
    @email NVARCHAR(255)
AS
BEGIN
    SELECT Id, Name, Email, Password, Active, BlockSharing
    FROM UsersTableFinal    WHERE Email = @email AND Active = 1
END
