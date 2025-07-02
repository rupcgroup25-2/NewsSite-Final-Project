USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <28.06.25>
-- Description:	<Get Active user number for admin>
-- =============================================
CREATE PROCEDURE sp_GetActiveUsersCountFinal
AS
BEGIN
    SELECT COUNT(*) AS CountActiveUsers FROM UsersTableFinal WHERE Active = 1
END
