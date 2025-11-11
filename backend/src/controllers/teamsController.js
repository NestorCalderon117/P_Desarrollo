import { getPool, sql } from '../config/database.js';

// Obtener todos los equipos con búsqueda y filtrado
export async function getAllTeams(req, res) {
  try {
    const { search, city } = req.query;
    const pool = await getPool();

    let query = `
      SELECT t.*,
        (SELECT p.id, p.name, p.full_name, p.number, p.position, p.height_cm, p.age, p.nationality
         FROM Players p
         WHERE p.team_id = t.id
         FOR JSON PATH) as players
      FROM Teams t
      WHERE 1=1
    `;

    const request = pool.request();

    // Filtro de búsqueda
    if (search) {
      query += ` AND (t.name LIKE @search OR t.city LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    // Filtro por ciudad
    if (city) {
      query += ` AND t.city = @city`;
      request.input('city', sql.NVarChar, city);
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await request.query(query);

    const teams = result.recordset.map(team => ({
      ...team,
      players: team.players ? JSON.parse(team.players) : []
    }));

    res.json(teams);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
}

// Obtener un equipo por ID
export async function getTeamById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query(`
        SELECT t.*,
          (SELECT p.id, p.name, p.full_name, p.number, p.position, p.height_cm, p.age, p.nationality
           FROM Players p
           WHERE p.team_id = t.id
           FOR JSON PATH) as players
        FROM Teams t
        WHERE t.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const team = result.recordset[0];
    team.players = team.players ? JSON.parse(team.players) : [];

    res.json(team);
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({ error: 'Error al obtener equipo' });
  }
}

// Crear un nuevo equipo
export async function createTeam(req, res) {
  try {
    const { id, name, city, founded_year, logo } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.VarChar, id)
      .input('name', sql.NVarChar, name)
      .input('city', sql.NVarChar, city || null)
      .input('founded_year', sql.Int, founded_year || null)
      .input('logo', sql.NVarChar(sql.MAX), logo || null)
      .query(`
        INSERT INTO Teams (id, name, city, founded_year, logo)
        VALUES (@id, @name, @city, @founded_year, @logo)
      `);

    res.status(201).json({ message: 'Equipo creado exitosamente', id });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ error: 'Error al crear equipo' });
  }
}

// Actualizar un equipo
export async function updateTeam(req, res) {
  try {
    const { id } = req.params;
    const { name, city, founded_year, logo } = req.body;
    const pool = await getPool();

    // Verificar si el equipo existe
    const existing = await pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT id FROM Teams WHERE id = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Actualizar equipo
    await pool.request()
      .input('id', sql.VarChar, id)
      .input('name', sql.NVarChar, name)
      .input('city', sql.NVarChar, city || null)
      .input('founded_year', sql.Int, founded_year || null)
      .input('logo', sql.NVarChar(sql.MAX), logo || null)
      .query(`
        UPDATE Teams
        SET name = @name,
            city = @city,
            founded_year = @founded_year,
            logo = @logo,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Equipo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({ error: 'Error al actualizar equipo' });
  }
}

// Eliminar un equipo
export async function deleteTeam(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Primero eliminar jugadores asociados
    await pool.request()
      .input('teamId', sql.VarChar, id)
      .query('DELETE FROM Players WHERE team_id = @teamId');

    // Luego eliminar el equipo
    await pool.request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM Teams WHERE id = @id');

    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
}

// Agregar jugador a un equipo
export async function addPlayer(req, res) {
  try {
    const { teamId } = req.params;
    const { id, name, full_name, number, position, height_cm, age, nationality } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.VarChar, id)
      .input('teamId', sql.VarChar, teamId)
      .input('name', sql.NVarChar, name)
      .input('full_name', sql.NVarChar, full_name || null)
      .input('number', sql.VarChar, number)
      .input('position', sql.NVarChar, position || null)
      .input('height_cm', sql.Int, height_cm || null)
      .input('age', sql.Int, age || null)
      .input('nationality', sql.NVarChar, nationality || null)
      .query(`
        INSERT INTO Players (id, team_id, name, full_name, number, position, height_cm, age, nationality)
        VALUES (@id, @teamId, @name, @full_name, @number, @position, @height_cm, @age, @nationality)
      `);

    res.status(201).json({ message: 'Jugador agregado exitosamente' });
  } catch (error) {
    console.error('Error al agregar jugador:', error);
    res.status(500).json({ error: 'Error al agregar jugador' });
  }
}

// Actualizar jugador
export async function updatePlayer(req, res) {
  try {
    const { playerId } = req.params;
    const { name, full_name, number, position, height_cm, age, nationality } = req.body;
    const pool = await getPool();

    const existing = await pool.request()
      .input('id', sql.VarChar, playerId)
      .query('SELECT id FROM Players WHERE id = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    await pool.request()
      .input('id', sql.VarChar, playerId)
      .input('name', sql.NVarChar, name)
      .input('full_name', sql.NVarChar, full_name || null)
      .input('number', sql.VarChar, number)
      .input('position', sql.NVarChar, position || null)
      .input('height_cm', sql.Int, height_cm || null)
      .input('age', sql.Int, age || null)
      .input('nationality', sql.NVarChar, nationality || null)
      .query(`
        UPDATE Players
        SET name = @name,
            full_name = @full_name,
            number = @number,
            position = @position,
            height_cm = @height_cm,
            age = @age,
            nationality = @nationality,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Jugador actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar jugador:', error);
    res.status(500).json({ error: 'Error al actualizar jugador' });
  }
}

// Eliminar jugador
export async function deletePlayer(req, res) {
  try {
    const { playerId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.VarChar, playerId)
      .query('DELETE FROM Players WHERE id = @id');

    res.json({ message: 'Jugador eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    res.status(500).json({ error: 'Error al eliminar jugador' });
  }
}

// Obtener todos los jugadores con información de su equipo
export async function getAllPlayers(req, res) {
  try {
    const { search, teamId, position } = req.query;
    const pool = await getPool();

    let query = `
      SELECT p.*,
        t.name as team_name,
        t.city as team_city,
        t.logo as team_logo
      FROM Players p
      LEFT JOIN Teams t ON p.team_id = t.id
      WHERE 1=1
    `;

    const request = pool.request();

    // Filtro de búsqueda por nombre
    if (search) {
      query += ` AND (p.name LIKE @search OR p.full_name LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    // Filtro por equipo
    if (teamId) {
      query += ` AND p.team_id = @teamId`;
      request.input('teamId', sql.VarChar, teamId);
    }

    // Filtro por posición
    if (position) {
      query += ` AND p.position = @position`;
      request.input('position', sql.NVarChar, position);
    }

    query += ` ORDER BY t.name, p.number`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
}

// Obtener un jugador por ID
export async function getPlayerById(req, res) {
  try {
    const { playerId } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.VarChar, playerId)
      .query(`
        SELECT p.*,
          t.name as team_name,
          t.city as team_city,
          t.logo as team_logo
        FROM Players p
        LEFT JOIN Teams t ON p.team_id = t.id
        WHERE p.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener jugador:', error);
    res.status(500).json({ error: 'Error al obtener jugador' });
  }
}
