CREATE PROCEDURE SP_DeleteArticleAndReportsFinal
    @ArticleId INT
AS
BEGIN
    DELETE FROM ReportsTableFinal WHERE ArticleId = @ArticleId
    DELETE FROM ArticlesTableFinal WHERE Id = @ArticleId
END
