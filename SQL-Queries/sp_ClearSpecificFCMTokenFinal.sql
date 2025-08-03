USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <03.08.25>
-- Description:	<Clear specific FCM token for a user on logout>
-- =============================================
CREATE PROCEDURE sp_ClearSpecificFCMTokenFinal
    @UserId INT,
    @FCMToken NVARCHAR(500)
AS
BEGIN
    -- Delete the specific token for the user
    DELETE FROM FCMTokensFinal 
    WHERE UserId = @UserId 
      AND FCMToken = @FCMToken
END