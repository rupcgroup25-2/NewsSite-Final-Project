USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <24.07.25>
-- Description:	<Get daily logins count>
-- =============================================
CREATE PROCEDURE sp_GetTotalDailyLoginsByDateFinal
AS
BEGIN
    --SET NOCOUNT ON;

    DECLARE @Date DATE = CAST(GETDATE() AS DATE);

    SELECT SUM(LoginCount) AS TotalLogins
    FROM DailyUserLoginsFinal
    WHERE LoginDate = @Date;
END