import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import teamsRoutes from './routes/teams.js';
import gamesRoutes from './routes/games.js';
import scheduledGamesRoutes from './routes/scheduledGames.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Basketball API is running' });
});

// Rutas protegidas (requieren autenticación)
app.use('/api/teams', authenticateToken, teamsRoutes);
app.use('/api/games', authenticateToken, gamesRoutes);
app.use('/api/scheduled-games', authenticateToken, scheduledGamesRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
async function startServer() {
  try {
    // Intentar conectar a la base de datos
    await connectDB();
    console.log('Base de datos conectada exitosamente');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    // Reintentar conexión después de 5 segundos
    console.log('Reintentando conexión en 5 segundos...');
    setTimeout(startServer, 5000);
  }
}

startServer();
