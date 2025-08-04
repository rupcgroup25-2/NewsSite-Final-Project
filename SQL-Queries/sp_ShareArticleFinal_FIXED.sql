USE [igroup102_test2]
GO

-- Drop existing procedure if exists
DROP PROCEDURE IF EXISTS sp_ShareArticleFinal
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<moty>
-- Create date: <20.06.25>
-- Description:	<Share article with a comment - FIXED VERSION>
-- =============================================
CREATE PROCEDURE sp_ShareArticleFinal
    @UserId INT,
    @ArticleId INT,
    @Comment NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if article is already shared by this user
    IF EXISTS (
        SELECT 1 FROM SharedArticlesTable
        WHERE UserId = @UserId AND ArticleId = @ArticleId
    )
    BEGIN
        SELECT 0 AS Result; -- Article already shared
        RETURN;
    END

    -- Insert the new shared article
    INSERT INTO SharedArticlesTable (UserId, ArticleId, Comment)
    VALUES (@UserId, @ArticleId, @Comment)
    
    SELECT 1 AS Result; -- Successfully shared
END
GO
