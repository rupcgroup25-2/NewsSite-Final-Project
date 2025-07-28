USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <28.07.25>
-- Description:	<select the counter>
-- =============================================
CREATE PROCEDURE sp_SelectApiCounterValueFinal
    @ApiName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CounterValue
    FROM ApiCallCountersFinal
    WHERE CounterName = @ApiName;
END