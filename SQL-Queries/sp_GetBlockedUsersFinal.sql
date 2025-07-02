USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <28.06.25>
-- Description:	<Get number of blocked users  for admin>
-- =============================================
Create PROCEDURE sp_CountBlockedUsersFinal
AS
BEGIN
    SELECT COUNT(*) AS BlockedUsersCount
    FROM UsersTableFinal
    WHERE BlockSharing = 1
END