CREATE PROCEDURE sp_RemoveUserTagFinal
    @UserId INT,
    @TagId INT
AS
BEGIN
    SET NOCOUNT OFF;

    DELETE FROM UserTagsTableFinal
    WHERE UserId = @UserId AND TagId = @TagId;
END
