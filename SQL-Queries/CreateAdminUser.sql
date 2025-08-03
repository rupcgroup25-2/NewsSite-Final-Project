-- Script ליצירת משתמש אדמין במידה ולא קיים
-- יש להריץ זאת פעם אחת על מנת לוודא שמשתמש האדמין קיים במערכת

USE [igroup102_test2]
GO

-- בדיקה אם משתמש האדמין כבר קיים
IF NOT EXISTS (SELECT 1 FROM UsersTableFinal WHERE Email = 'admin@newshub.com')
BEGIN
    -- יצירת משתמש אדמין חדש
    INSERT INTO UsersTableFinal (Name, Email, Password, Active, BlockSharing)
    VALUES ('admin', 'admin@newshub.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdpQpA5WTfHaH8u', 1, 0);
    -- הסיסמה המוצפנת היא "admin123" - יש לשנות לסיסמה חזקה יותר!
    
    PRINT 'Admin user created successfully with email: admin@newshub.com';
END
ELSE
BEGIN
    PRINT 'Admin user already exists with email: admin@newshub.com';
END

-- בדיקה שהמשתמש קיים ופעיל
SELECT Id, Name, Email, Active, BlockSharing 
FROM UsersTableFinal 
WHERE Email = 'admin@newshub.com';
