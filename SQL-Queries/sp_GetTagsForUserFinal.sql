CREATE PROCEDURE sp_GetTagsForUserFinal
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT t.Id, t.Name
    FROM TagsTableFinal t
    INNER JOIN UserTagsTableFinal ut ON t.Id = ut.TagId
    WHERE ut.UserId = @UserId;
END
