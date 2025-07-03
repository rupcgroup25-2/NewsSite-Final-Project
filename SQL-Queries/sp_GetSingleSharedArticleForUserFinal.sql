USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<niv>
-- Create date: <04.07.25>
-- Description:	<Get single saved article>
-- =============================================
CREATE PROCEDURE sp_GetSingleSharedArticleForUserFinal
    @UserId INT,
	@ArticleId INT
AS
BEGIN
	SELECT A.*
	FROM SharedArticlesTable S
	JOIN ArticlesTableFinal A ON S.ArticleId = A.Id
	WHERE S.UserId = @UserId AND A.Id = @ArticleId
END