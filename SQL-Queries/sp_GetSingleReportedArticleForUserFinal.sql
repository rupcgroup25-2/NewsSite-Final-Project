USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <28.07.25>
-- Description:	<Get single saved article>
-- =============================================
create PROCEDURE [dbo].[sp_GetSingleReportedArticleForUserFinal]
    @UserId INT,
	@ArticleId INT
AS
BEGIN
	SELECT A.*
	FROM ReportsTableFinal R
	JOIN ArticlesTableFinal A ON R.ArticleId = A.Id
	WHERE R.ReporterId = @UserId AND A.Id = @ArticleId
END