ALTER PROCEDURE [dbo].[sp_UnfollowUserByEmailFinal]
    @FollowerId INT,
    @FollowedEmail NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT OFF;

    DECLARE @FollowedId INT;

    SELECT @FollowedId = Id FROM UsersTableFinal WHERE Email = @FollowedEmail;

    IF @FollowedId IS NULL
    BEGIN
        RETURN -1; -- User not found
    END

    DELETE FROM UserFollowTableFinal
    WHERE FollowerId = @FollowerId AND FollowedId = @FollowedId;

    RETURN 1; -- Unfollow successful
END
