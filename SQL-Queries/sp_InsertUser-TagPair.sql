ALTER PROCEDURE [dbo].[sp_InsertUser-TagPair]
    @UserId INT,
    @TagName NVARCHAR(100)
AS
BEGIN
    DECLARE @TagId INT;

    -- Check if the tag exists, get its ID
    SELECT @TagId = Id
    FROM TagsTableFinal
    WHERE LOWER([Name]) = LOWER(@TagName);

    -- If the tag doesn't exist, insert it using existing SP
    IF @TagId IS NULL
    BEGIN
        EXEC [dbo].[sp_InsertTagFinal] @Name = @TagName;

        -- Get the new TagId
        SELECT @TagId = Id
        FROM TagsTableFinal
        WHERE LOWER([Name]) = LOWER(@TagName);
    END

    -- Check if user exists
    IF NOT EXISTS (
        SELECT 1
        FROM UsersTableFinal
        WHERE Id = @UserId
    )
    BEGIN
        RAISERROR('User with ID %d does not exist.', 16, 1, @UserId);
        RETURN;
    END

    -- Check if user-tag pair already exists
    IF EXISTS (
        SELECT 1
        FROM UserTagsTableFinal
        WHERE UserId = @UserId AND TagId = @TagId
    )
    BEGIN
        RAISERROR('This user is already associated with the tag "%s".', 16, 1, @TagName);
        RETURN;
    END

    -- Insert the user-tag pair
    INSERT INTO UserTagsTableFinal (UserId, TagId)
    VALUES (@UserId, @TagId);

    -- Return the TagId
    SELECT @TagId AS TagId;
END
