-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BasketballDB')
BEGIN
    CREATE DATABASE BasketballDB;
END
GO

USE BasketballDB;
GO

-- Tabla de Usuarios (Administradores)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) UNIQUE NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) DEFAULT 'admin', -- 'admin', 'superadmin'
        created_at DATETIME2 DEFAULT GETDATE(),
        last_login DATETIME2
    );
END
GO

-- Insertar usuario admin por defecto (password: admin123)
IF NOT EXISTS (SELECT * FROM Users WHERE username = 'admin')
BEGIN
    INSERT INTO Users (username, email, password_hash, role)
    VALUES ('admin', 'admin@basketball.com', '$2b$10$0fKCFq9xZEbLLAUG9QPTLuh.3s9Nl6V7NBFoODHO.lZTSOS4RL3oW', 'superadmin');
END
GO

-- Tabla de Equipos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Teams')
BEGIN
    CREATE TABLE Teams (
        id VARCHAR(100) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        city NVARCHAR(100),
        founded_year INT,
        logo NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Tabla de Jugadores
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Players')
BEGIN
    CREATE TABLE Players (
        id VARCHAR(100) PRIMARY KEY,
        team_id VARCHAR(100) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(255),
        number VARCHAR(10) NOT NULL,
        position NVARCHAR(50), -- 'Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'
        height_cm INT,
        age INT,
        nationality NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (team_id) REFERENCES Teams(id) ON DELETE CASCADE
    );
END
GO

-- Tabla de Partidos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Games')
BEGIN
    CREATE TABLE Games (
        id INT IDENTITY(1,1) PRIMARY KEY,
        teamA_id VARCHAR(100),
        teamA_name NVARCHAR(255) NOT NULL,
        teamB_id VARCHAR(100),
        teamB_name NVARCHAR(255) NOT NULL,
        finalScoreA INT NOT NULL,
        finalScoreB INT NOT NULL,
        period INT NOT NULL,
        status VARCHAR(20) NOT NULL, -- 'completed', 'cancelled', 'suspended'
        stats NVARCHAR(MAX), -- JSON con estadísticas del juego
        settings NVARCHAR(MAX), -- JSON con configuración del partido
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (teamA_id) REFERENCES Teams(id),
        FOREIGN KEY (teamB_id) REFERENCES Teams(id)
    );
END
GO

-- Tabla de Historial de Jugadas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GameHistory')
BEGIN
    CREATE TABLE GameHistory (
        id INT IDENTITY(1,1) PRIMARY KEY,
        game_id INT NOT NULL,
        team VARCHAR(1) NOT NULL, -- 'A' o 'B'
        player_name NVARCHAR(255),
        player_number VARCHAR(10),
        delta INT NOT NULL, -- Puntos anotados (+) o restados (-)
        scoreA INT NOT NULL,
        scoreB INT NOT NULL,
        period INT NOT NULL,
        timestamp BIGINT NOT NULL, -- Timestamp en milisegundos
        FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
    );
END
GO

-- Tabla de Sanciones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sanctions')
BEGIN
    CREATE TABLE Sanctions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        game_id INT NOT NULL,
        team VARCHAR(1) NOT NULL, -- 'A' o 'B'
        player_name NVARCHAR(255),
        player_number VARCHAR(10),
        type VARCHAR(50) NOT NULL, -- 'Personal', 'Técnica', 'Antideportiva'
        period INT NOT NULL,
        timestamp BIGINT NOT NULL, -- Timestamp en milisegundos
        FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
    );
END
GO

-- Tabla de Partidos Programados
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ScheduledGames')
BEGIN
    CREATE TABLE ScheduledGames (
        id INT IDENTITY(1,1) PRIMARY KEY,
        teamA_id VARCHAR(100) NOT NULL,
        teamA_name NVARCHAR(255) NOT NULL,
        teamB_id VARCHAR(100) NOT NULL,
        teamB_name NVARCHAR(255) NOT NULL,
        scheduled_date DATETIME2 NOT NULL,
        location NVARCHAR(255),
        status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
        created_at DATETIME2 DEFAULT GETDATE(),
        created_by INT,
        FOREIGN KEY (teamA_id) REFERENCES Teams(id),
        FOREIGN KEY (teamB_id) REFERENCES Teams(id),
        FOREIGN KEY (created_by) REFERENCES Users(id)
    );
END
GO

-- Tabla de Roster de Partidos (jugadores asignados a un partido)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GameRoster')
BEGIN
    CREATE TABLE GameRoster (
        id INT IDENTITY(1,1) PRIMARY KEY,
        scheduled_game_id INT NOT NULL,
        player_id VARCHAR(100) NOT NULL,
        team VARCHAR(1) NOT NULL, -- 'A' o 'B'
        FOREIGN KEY (scheduled_game_id) REFERENCES ScheduledGames(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES Players(id)
    );
END
GO

-- Índices para mejorar el rendimiento (compatibles con SQL Server)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_players_team' AND object_id = OBJECT_ID('Players')
)
BEGIN
    CREATE INDEX idx_players_team ON Players(team_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_gamehistory_game' AND object_id = OBJECT_ID('GameHistory')
)
BEGIN
    CREATE INDEX idx_gamehistory_game ON GameHistory(game_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_sanctions_game' AND object_id = OBJECT_ID('Sanctions')
)
BEGIN
    CREATE INDEX idx_sanctions_game ON Sanctions(game_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_games_created' AND object_id = OBJECT_ID('Games')
)
BEGIN
    CREATE INDEX idx_games_created ON Games(created_at);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_users_username' AND object_id = OBJECT_ID('Users')
)
BEGIN
    CREATE INDEX idx_users_username ON Users(username);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_scheduled_games_date' AND object_id = OBJECT_ID('ScheduledGames')
)
BEGIN
    CREATE INDEX idx_scheduled_games_date ON ScheduledGames(scheduled_date);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_game_roster_game' AND object_id = OBJECT_ID('GameRoster')
)
BEGIN
    CREATE INDEX idx_game_roster_game ON GameRoster(scheduled_game_id);
END
GO

PRINT 'Base de datos BasketballDB inicializada correctamente';
GO
