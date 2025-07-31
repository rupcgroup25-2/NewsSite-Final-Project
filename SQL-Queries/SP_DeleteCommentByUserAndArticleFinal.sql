SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE SP_DeleteCommentByUserAndArticleFinal
-- Add the parameters for the stored procedure here
    @UserId INT,
    @ArticleId INT
AS
BEGIN

-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.

    -- Insert statements for procedure here
    DELETE FROM CommentsTableFinal
    WHERE UserId = @UserId AND ArticleId = @ArticleId
END
GO
