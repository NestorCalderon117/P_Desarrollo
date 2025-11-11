import express from 'express';
import { body } from 'express-validator';
import {
  login,
  register,
  getProfile,
  changePassword,
  logout
} from '../controllers/authController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Validaciones para login
const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validaciones para registro
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'superadmin'])
    .withMessage('El rol debe ser "admin" o "superadmin"')
];

// Validaciones para cambio de contraseña
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }
      return true;
    })
];

// Rutas públicas
router.post('/login', loginValidation, login);
router.post('/logout', logout);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, getProfile);
router.post('/change-password', authenticateToken, changePasswordValidation, changePassword);

// Rutas solo para superadmin
router.post('/register', authenticateToken, authorizeRoles('superadmin'), registerValidation, register);

export default router;
