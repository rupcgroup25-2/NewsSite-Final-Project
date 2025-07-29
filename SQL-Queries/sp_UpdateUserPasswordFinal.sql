USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Moty>
-- Create date: <29.07.2025>
-- Description:	<update user password>
-- =============================================
Create PROCEDURE [dbo].[sp_UpdateUserPasswordFinal]
    @UserId INT,
    @NewPassword NVARCHAR(300)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE UsersTableFinal
    SET [Password] = @NewPassword
    WHERE Id = @UserId;
END;