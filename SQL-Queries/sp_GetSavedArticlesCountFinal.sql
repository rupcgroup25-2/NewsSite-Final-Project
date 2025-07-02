USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <28.06.25>
-- Description:	<Get number of saved articles for admin>
-- =============================================
CREATE PROCEDURE sp_GetSavedArticlesCountFinal
AS
BEGIN
    SELECT COUNT(*) AS Count FROM SavedArticlesTable
END