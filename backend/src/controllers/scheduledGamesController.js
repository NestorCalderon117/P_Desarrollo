import { getPool, sql } from '../config/database.js';

// Obtener todos los partidos programados
export async function getAllScheduledGames(req, res) {
  try {
    const { status, teamId, fromDate, toDate } = req.query;
    const pool = await getPool();

    let query = `
      SELECT sg.*,
        (SELECT gr.id, gr.player_id, gr.team,
                p.name, p.number, p.position
         FROM GameRoster gr
         INNER JOIN Players p ON gr.player_id = p.id
         WHERE gr.scheduled_game_id = sg.id
         FOR JSON PATH) as roster
      FROM ScheduledGames sg
      WHERE 1=1
    `;

    const request = pool.request();

    // Filtros
    if (status) {
      query += ` AND sg.status = @status`;
      request.input('status', sql.VarChar, status);
    }

    if (teamId) {
      query += ` AND (sg.teamA_id = @teamId OR sg.teamB_id = @teamId)`;
      request.input('teamId', sql.VarChar, teamId);
    }

    if (fromDate) {
      query += ` AND sg.scheduled_date >= @fromDate`;
      request.input('fromDate', sql.DateTime2, fromDate);
    }

    if (toDate) {
      query += ` AND sg.scheduled_date <= @toDate`;
      request.input('toDate', sql.DateTime2, toDate);
    }

    query += ` ORDER BY sg.scheduled_date DESC`;

    const result = await request.query(query);

    const games = result.recordset.map(game => ({
      ...game,
      roster: game.roster ? JSON.parse(game.roster) : []
    }));

    res.json(games);
  } catch (error) {
    console.error('Error al obtener partidos programados:', error);
    res.status(500).json({ error: 'Error al obtener partidos programados' });
  }
}

// Obtener un partido programado por ID
export async function getScheduledGameById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT sg.*,
          (SELECT gr.id, gr.player_id, gr.team,
                  p.name, p.full_name, p.number, p.position
           FROM GameRoster gr
           INNER JOIN Players p ON gr.player_id = p.id
           WHERE gr.scheduled_game_id = sg.id
           FOR JSON PATH) as roster
        FROM ScheduledGames sg
        WHERE sg.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    const game = result.recordset[0];
    game.roster = game.roster ? JSON.parse(game.roster) : [];

    res.json(game);
  } catch (error) {
    console.error('Error al obtener partido:', error);
    res.status(500).json({ error: 'Error al obtener partido' });
  }
}

// Crear un partido programado
export async function createScheduledGame(req, res) {
  try {
    const {
      teamA_id,
      teamA_name,
      teamB_id,
      teamB_name,
      scheduled_date,
      location,
      roster
    } = req.body;

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Insertar partido
      const gameResult = await transaction.request()
        .input('teamA_id', sql.VarChar, teamA_id)
        .input('teamA_name', sql.NVarChar, teamA_name)
        .input('teamB_id', sql.VarChar, teamB_id)
        .input('teamB_name', sql.NVarChar, teamB_name)
        .input('scheduled_date', sql.DateTime2, scheduled_date)
        .input('location', sql.NVarChar, location || null)
        .input('created_by', sql.Int, req.user.id)
        .query(`
          INSERT INTO ScheduledGames
            (teamA_id, teamA_name, teamB_id, teamB_name, scheduled_date, location, created_by)
          OUTPUT INSERTED.id
          VALUES (@teamA_id, @teamA_name, @teamB_id, @teamB_name, @scheduled_date, @location, @created_by)
        `);

      const gameId = gameResult.recordset[0].id;

      // Insertar roster si existe
      if (roster && roster.length > 0) {
        for (const player of roster) {
          await transaction.request()
            .input('scheduled_game_id', sql.Int, gameId)
            .input('player_id', sql.VarChar, player.player_id)
            .input('team', sql.VarChar, player.team)
            .query(`
              INSERT INTO GameRoster (scheduled_game_id, player_id, team)
              VALUES (@scheduled_game_id, @player_id, @team)
            `);
        }
      }

      await transaction.commit();

      res.status(201).json({
        message: 'Partido programado exitosamente',
        gameId
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al crear partido programado:', error);
    res.status(500).json({ error: 'Error al crear partido programado' });
  }
}

// Actualizar partido programado
export async function updateScheduledGame(req, res) {
  try {
    const { id } = req.params;
    const {
      teamA_id,
      teamA_name,
      teamB_id,
      teamB_name,
      scheduled_date,
      location,
      status,
      roster
    } = req.body;

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Verificar si existe
      const existing = await transaction.request()
        .input('id', sql.Int, id)
        .query('SELECT id FROM ScheduledGames WHERE id = @id');

      if (existing.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Partido no encontrado' });
      }

      // Actualizar partido
      await transaction.request()
        .input('id', sql.Int, id)
        .input('teamA_id', sql.VarChar, teamA_id)
        .input('teamA_name', sql.NVarChar, teamA_name)
        .input('teamB_id', sql.VarChar, teamB_id)
        .input('teamB_name', sql.NVarChar, teamB_name)
        .input('scheduled_date', sql.DateTime2, scheduled_date)
        .input('location', sql.NVarChar, location || null)
        .input('status', sql.VarChar, status || 'scheduled')
        .query(`
          UPDATE ScheduledGames
          SET teamA_id = @teamA_id,
              teamA_name = @teamA_name,
              teamB_id = @teamB_id,
              teamB_name = @teamB_name,
              scheduled_date = @scheduled_date,
              location = @location,
              status = @status
          WHERE id = @id
        `);

      // Actualizar roster si se proporciona
      if (roster !== undefined) {
        // Eliminar roster existente
        await transaction.request()
          .input('id', sql.Int, id)
          .query('DELETE FROM GameRoster WHERE scheduled_game_id = @id');

        // Insertar nuevo roster
        if (roster.length > 0) {
          for (const player of roster) {
            await transaction.request()
              .input('scheduled_game_id', sql.Int, id)
              .input('player_id', sql.VarChar, player.player_id)
              .input('team', sql.VarChar, player.team)
              .query(`
                INSERT INTO GameRoster (scheduled_game_id, player_id, team)
                VALUES (@scheduled_game_id, @player_id, @team)
              `);
          }
        }
      }

      await transaction.commit();

      res.json({ message: 'Partido actualizado exitosamente' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al actualizar partido:', error);
    res.status(500).json({ error: 'Error al actualizar partido' });
  }
}

// Eliminar partido programado
export async function deleteScheduledGame(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // El roster se eliminará automáticamente por CASCADE
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM ScheduledGames WHERE id = @id');

    res.json({ message: 'Partido eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar partido:', error);
    res.status(500).json({ error: 'Error al eliminar partido' });
  }
}

// Cambiar estado del partido
export async function updateGameStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pool = await getPool();

    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.VarChar, status)
      .query('UPDATE ScheduledGames SET status = @status WHERE id = @id');

    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
}
