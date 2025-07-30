SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE SP_DeleteAllCommentsForArticleFinal
	-- Add the parameters for the stored procedure here
	  @ArticleId INT

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.

    DELETE FROM CommentsTableFinal
    WHERE ArticleId = @ArticleId
END
GO
