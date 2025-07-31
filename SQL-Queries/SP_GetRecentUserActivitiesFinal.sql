CREATE PROCEDURE SP_GetRecentUserActivitiesFinal
    @UserId INT,
    @numOfActivities INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@numOfActivities) *
    FROM (
        SELECT 
            'Saved article "' + A.Title + '"' AS ActivityType,
            S.SavedAt AS ActivityDate
        FROM SavedArticlesTable S 
        JOIN ArticlesTableFinal A ON S.ArticleId = A.Id
        WHERE S.UserId = @UserId

        UNION ALL

        SELECT 
            'Shared article "' + A.Title + '" with comment: "' + ISNULL(S.Comment, '') + '"' AS ActivityType,
            S.SharedAt AS ActivityDate
        FROM SharedArticlesTable S 
        JOIN ArticlesTableFinal A ON S.ArticleId = A.Id
        WHERE S.UserId = @UserId

        UNION ALL

        SELECT 
            'Reported article "' + A.Title + '" with comment: "' + ISNULL(S.Comment, '') + '"' AS ActivityType,
            S.ReportedAt AS ActivityDate
        FROM ReportsTableFinal S 
        JOIN ArticlesTableFinal A ON S.ArticleId = A.Id
        WHERE S.ReporterId = @UserId

        UNION ALL

        SELECT 
            'Added comment: "' + C.CommentText + '" on article "' + A.Title + '"' AS ActivityType,
            C.CreatedAt AS ActivityDate
        FROM CommentsTableFinal C 
        JOIN ArticlesTableFinal A ON C.ArticleId = A.Id
        WHERE C.UserId = @UserId

        UNION ALL

        SELECT 
            'Created tag "' + T.Name + '"' AS ActivityType,
            UT.CreatedAt AS ActivityDate
        FROM UserTagsTableFinal UT 
        JOIN TagsTableFinal T ON UT.TagId = T.Id
        WHERE UT.UserId = @UserId
    ) AS Activities
    ORDER BY ActivityDate DESC
END
