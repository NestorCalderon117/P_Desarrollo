import express from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addPlayer,
  updatePlayer,
  deletePlayer,
  getAllPlayers,
  getPlayerById
} from '../controllers/teamsController.js';

const router = express.Router();

// Rutas de equipos
router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

// Rutas de jugadores
router.get('/players/all', getAllPlayers);
router.get('/players/:playerId', getPlayerById);
router.post('/:teamId/players', addPlayer);
router.put('/players/:playerId', updatePlayer);
router.delete('/players/:playerId', deletePlayer);

export default router;
