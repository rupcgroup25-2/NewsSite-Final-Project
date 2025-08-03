USE [igroup102_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<moty>
-- Create date: <30.07.25>
-- Description:	<Get FCM Tokens For Users>
-- =============================================

-- ���� FCM Tokens �������� (�� ������ �� ������ �������)
CREATE PROCEDURE sp_GetFCMTokensForUsersFinal
    @UserIds NVARCHAR(MAX)
AS
BEGIN
    SELECT DISTINCT FCMToken
    FROM FCMTokensFinal f
    INNER JOIN STRING_SPLIT(@UserIds, ',') s ON f.UserId = CAST(s.value AS INT)
    WHERE f.IsActive = 1 AND f.NotificationsEnabled = 1
END
