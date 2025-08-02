CREATE PROCEDURE SP_DeleteArticleAndReportsFinal
    @ArticleId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM ArticlesTableFinal WHERE Id = @ArticleId)
    BEGIN
		DELETE FROM CommentsTableFinal WHERE ArticleId = @ArticleId;
        DELETE FROM ArticleTagsTableFinal WHERE ArticleId = @ArticleId;
        DELETE FROM SharedArticlesTable WHERE ArticleId = @ArticleId;
        DELETE FROM ReportsTableFinal WHERE ArticleId = @ArticleId;
		DELETE FROM SavedArticlesTable WHERE ArticleId = @ArticleId;

        DELETE FROM ArticlesTableFinal WHERE Id = @ArticleId;

        SELECT 1 AS Deleted;  -- מחיקה הצליחה
    END
    ELSE
    BEGIN
        SELECT 0 AS Deleted;  -- לא נמצאה כתבה למחיקה
    END
END


