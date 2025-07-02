USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <28.06.25>
-- Description:	<Get number of Reports for admin>
-- =============================================
Alter PROCEDURE sp_GetReportsCountFinal
AS
BEGIN
    SELECT COUNT(*) as CountReports FROM ReportsTableFinal
END