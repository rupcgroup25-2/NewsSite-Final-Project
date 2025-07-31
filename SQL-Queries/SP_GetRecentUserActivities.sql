SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE SP_GetRecentUserActivitiesFinal
    @UserId INT,
	@numOfActivities INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@numOfActivities) *
    FROM (
        SELECT 
           'Saved article ' + A.Title AS ActivityType,
            SavedAt AS ActivityDate
        FROM SavedArticlesTable S JOIN ArticlesTableFinal A ON S.ArticleId = A.Id
        WHERE UserId = @UserId

        UNION ALL

        SELECT 
            'Shared Article ' + A.Title 'with comment' + S.Comment AS ActivityType,
            SharedAt AS ActivityDate
        FROM SharedArticlesTable S JOIN ArticlesTableFinal A ON S.ArticleId = A.Id
        WHERE UserId = @UserId

        UNION ALL

        SELECT 
            'Reported Article ' + A.Title 'with comment' + S.Comment AS ActivityType,
            ReportedAt AS ActivityDate
        FROM ReportsTableFinal S JOIN ArticlesTableFinal A ON S.ArticleId = A.Id
        WHERE ReporterId = @UserId

        UNION ALL

		SELECT 
            'Added Comment ' + C.CommentText + 'on article' + A.Title AS ActivityType,
            CreatedAt AS ActivityDate
        FROM CommentsTableFinal C JOIN ArticlesTableFinal A ON C.UserId = A.Id
        WHERE Id = @UserId

        UNION ALL

        SELECT 
            'Create Tag' +  AS ActivityType,
            CreatedAt AS ActivityDate
        FROM UserTagsTableFinal UT JOIN TagsTableFinal T ON UT.TagId = T.Id
        WHERE UserId = @UserId
    ) AS Activities

    ORDER BY ActivityDate DESC
END
GO
