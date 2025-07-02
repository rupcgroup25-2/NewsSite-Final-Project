USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <1.07.25>
-- Description:	<Get all reports>
-- =============================================
alter PROCEDURE [dbo].[sp_GetAllReportsFinal]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id,
        ReporterId,
        ArticleId,
        SharedArticleId,
        Comment,
        ReportedAt
    FROM ReportsTableFinal
    ORDER BY ReportedAt DESC;
END
