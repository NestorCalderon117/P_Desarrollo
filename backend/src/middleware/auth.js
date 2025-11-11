import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware para verificar autenticación JWT
 */
export function authenticateToken(req, res, next) {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Verificar el token
    const decoded = verifyToken(token);

    // Agregar información del usuario a la request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Token inválido',
      message: error.message
    });
  }
}

/**
 * Middleware para verificar roles específicos
 * @param {...string} allowedRoles - Roles permitidos
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos suficientes para acceder a este recurso'
      });
    }

    next();
  };
}

/**
 * Middleware opcional - no falla si no hay token
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      };
    }
  } catch (error) {
    // Ignorar errores en autenticación opcional
  }

  next();
}
