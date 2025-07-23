USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <23.07.25>
-- Description:	<Get single saved article>
-- =============================================
ALTER PROCEDURE [dbo].[sp_GetSharedArticleByIdFinal]
	@ArticleId INT
AS
BEGIN
	SELECT A.*
	FROM SharedArticlesTable S
	JOIN ArticlesTableFinal A ON S.ArticleId = A.Id
	WHERE A.Id = @ArticleId
END