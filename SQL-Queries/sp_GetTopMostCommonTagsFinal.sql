CREATE PROCEDURE [dbo].[sp_GetTopMostCommonTagsFinal]
    @TopCount INT
AS
BEGIN
    SET NOCOUNT OFF;

    SELECT TOP (@TopCount)
        T.Name,
        COUNT(*) AS TagCount
    FROM UserTagsTableFinal UTT
    JOIN TagsTableFinal T ON UTT.TagId = T.Id
    GROUP BY T.Name
    ORDER BY TagCount DESC
END
