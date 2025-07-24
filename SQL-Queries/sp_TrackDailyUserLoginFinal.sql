USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <24.07.25>
-- Description:	<update daily logins count>
-- =============================================
alter PROCEDURE sp_TrackDailyUserLoginFinal
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Today DATE = CAST(GETDATE() AS DATE);

    IF EXISTS (
        SELECT 1 
        FROM DailyUserLoginsFinal 
        WHERE UserId = @UserId AND LoginDate = @Today
    )
    BEGIN
        UPDATE DailyUserLoginsFinal
        SET LoginCount = LoginCount + 1
        WHERE UserId = @UserId AND LoginDate = @Today;
    END
    ELSE
    BEGIN
        INSERT INTO DailyUserLoginsFinal (UserId, LoginDate, LoginCount)
        VALUES (@UserId, @Today, 1);
     END
END