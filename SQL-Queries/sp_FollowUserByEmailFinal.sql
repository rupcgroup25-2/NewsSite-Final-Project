ALTER PROCEDURE sp_FollowUserByEmailFinal
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

    IF EXISTS (
        SELECT 1 
        FROM UserFollowTableFinal 
        WHERE FollowerId = @FollowerId AND FollowedId = @FollowedId
    )
    BEGIN
        RETURN 0; -- Already following
    END

    INSERT INTO UserFollowTableFinal (FollowerId, FollowedId)
    VALUES (@FollowerId, @FollowedId);

    RETURN 1; -- Follow successful
END
