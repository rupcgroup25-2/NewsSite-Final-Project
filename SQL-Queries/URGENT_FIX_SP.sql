-- URGENT FIX: Update stored procedure with correct table names
-- Run this in SQL Server Management Studio or Visual Studio connected to igroup102_test2

USE [igroup102_test2]
GO

-- Drop and recreate the procedure with correct table names
DROP PROCEDURE IF EXISTS sp_GetUsersWhoCommentedOnArticleFinal
GO

CREATE PROCEDURE sp_GetUsersWhoCommentedOnArticleFinal
    @ArticleId INT,
    @ExcludeUserId INT
AS
BEGIN
    SELECT DISTINCT c.UserId
    FROM CommentsTableFinal c
    LEFT JOIN FCMTokensFinal f ON c.UserId = f.UserId
    WHERE c.ArticleId = @ArticleId 
      AND c.UserId != @ExcludeUserId
      AND (f.UserId IS NULL OR (f.IsActive = 1 AND f.NotificationsEnabled = 1))
END
GO

-- Test the procedure
PRINT 'Testing the updated procedure...'
EXEC sp_GetUsersWhoCommentedOnArticleFinal @ArticleId = 186, @ExcludeUserId = 1012
PRINT 'Procedure updated successfully!'
