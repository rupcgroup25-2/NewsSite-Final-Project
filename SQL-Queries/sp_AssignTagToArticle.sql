USE [igroup102_test2]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAllTags]    Script Date: 18/06/2025 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <18.06.25>
-- Description:	<Select all tags from Tags table>
-- =============================================
CREATE PROCEDURE [dbo].[sp_AssignTagToArticle]
    @ArticleId INT,
    @TagName INT
AS
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM ArticleTagsTableFinal
        WHERE ArticleId = @ArticleId AND TagName = @TagName
    )
    BEGIN
        INSERT INTO ArticleTagsTableFinal (ArticleId, TagName)
        VALUES (@ArticleId, @TagName)
    END
END