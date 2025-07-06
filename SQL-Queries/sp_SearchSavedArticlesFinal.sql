USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <06.07.25>
-- Description:	<Get articles match a text the user search>
-- =============================================
create PROCEDURE [dbo].[sp_SearchSavedArticlesFinal]
    @UserId INT,
    @SearchText NVARCHAR(100)
AS
BEGIN
    SELECT a.*
    FROM SavedArticlesTable s
    INNER JOIN ArticlesTableFinal a ON s.ArticleId = a.Id
    WHERE s.UserId = @UserId
      AND (a.Title LIKE '%' + @SearchText + '%'
         OR a.[Description] LIKE '%' + @SearchText + '%')
END