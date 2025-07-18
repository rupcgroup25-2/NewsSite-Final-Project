CREATE PROCEDURE sp_GetAllUserEmailsFinal
AS
BEGIN
    SELECT [Email] FROM UsersTableFinal WHERE [Name] != 'admin'
END
