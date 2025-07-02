USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <1.07.25>
-- Description:	<Get all articles>
-- =============================================
create PROCEDURE [dbo].[sp_GetAllArticlesFinal]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Id,
        Title,
        Description,
        Url,
        UrlToImage,
        PublishedAt,
        SourceName,
        Author
    FROM ArticlesTableFinal
    ORDER BY PublishedAt DESC;  
END