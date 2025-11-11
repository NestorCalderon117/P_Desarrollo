-- Script de migración para agregar columnas faltantes
USE BasketballDB;
GO

PRINT 'Iniciando migración de base de datos...';
GO

-- Agregar columnas a Teams si no existen
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Teams') AND name = 'city')
BEGIN
    ALTER TABLE Teams ADD city NVARCHAR(100);
    PRINT 'Columna city agregada a Teams';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Teams') AND name = 'founded_year')
BEGIN
    ALTER TABLE Teams ADD founded_year INT;
    PRINT 'Columna founded_year agregada a Teams';
END
GO

-- Agregar columnas a Players si no existen
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Players') AND name = 'full_name')
BEGIN
    ALTER TABLE Players ADD full_name NVARCHAR(255);
    PRINT 'Columna full_name agregada a Players';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Players') AND name = 'position')
BEGIN
    ALTER TABLE Players ADD position NVARCHAR(50);
    PRINT 'Columna position agregada a Players';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Players') AND name = 'height_cm')
BEGIN
    ALTER TABLE Players ADD height_cm INT;
    PRINT 'Columna height_cm agregada a Players';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Players') AND name = 'age')
BEGIN
    ALTER TABLE Players ADD age INT;
    PRINT 'Columna age agregada a Players';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Players') AND name = 'nationality')
BEGIN
    ALTER TABLE Players ADD nationality NVARCHAR(100);
    PRINT 'Columna nationality agregada a Players';
END
GO

PRINT 'Migración completada exitosamente';
GO
