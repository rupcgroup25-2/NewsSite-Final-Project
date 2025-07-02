USE [igroup102_test2]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAllReportsFinal]    Script Date: 02/07/2025 17:23:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <1.07.25>
-- Description:	<Get all reports>
-- =============================================
Create PROCEDURE [dbo].[sp_GetAllReportsOnArticlesFinal]
AS
BEGIN
    SET NOCOUNT ON;

   
select R.ReporterId,r.ArticleId,r.Comment,r.ReportedAt,a.Title,a.[Description],a.PublishedAt,a.SourceName 
from ReportsTableFinal R
join ArticlesTableFinal A on R.ArticleId = A.Id
    ORDER BY ReportedAt DESC;
END
