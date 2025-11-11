import express from 'express';
import {
  getAllScheduledGames,
  getScheduledGameById,
  createScheduledGame,
  updateScheduledGame,
  deleteScheduledGame,
  updateGameStatus
} from '../controllers/scheduledGamesController.js';

const router = express.Router();

router.get('/', getAllScheduledGames);
router.get('/:id', getScheduledGameById);
router.post('/', createScheduledGame);
router.put('/:id', updateScheduledGame);
router.delete('/:id', deleteScheduledGame);
router.patch('/:id/status', updateGameStatus);

export default router;
