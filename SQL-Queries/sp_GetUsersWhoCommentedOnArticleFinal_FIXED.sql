USE [igroup102_test2]
GO

-- Drop existing procedure if exists
DROP PROCEDURE IF EXISTS sp_GetUsersWhoCommentedOnArticleFinal
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<Get Users Who Commented On Article - FIXED VERSION WITH CORRECT TABLE NAMES>
-- =============================================
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
