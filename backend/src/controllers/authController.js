import { getPool, sql } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { validationResult } from 'express-validator';

/**
 * Login de usuario
 */
export async function login(req, res) {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const pool = await getPool();

    // Buscar usuario
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      });
    }

    const user = result.recordset[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Actualizar último login
    await pool.request()
      .input('id', sql.Int, user.id)
      .query('UPDATE Users SET last_login = GETDATE() WHERE id = @id');

    // Generar token JWT
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    // Retornar usuario y token (sin password)
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

/**
 * Registro de nuevo usuario (solo para superadmin)
 */
export async function register(req, res) {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = 'admin' } = req.body;
    const pool = await getPool();

    // Verificar si el usuario ya existe
    const existingUser = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE username = @username OR email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        error: 'Usuario ya existe',
        message: 'El nombre de usuario o email ya están registrados'
      });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insertar usuario
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, password_hash)
      .input('role', sql.NVarChar, role)
      .query(`
        INSERT INTO Users (username, email, password_hash, role)
        OUTPUT INSERTED.*
        VALUES (@username, @email, @password_hash, @role)
      `);

    const newUser = result.recordset[0];

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

/**
 * Obtener perfil del usuario autenticado
 */
export async function getProfile(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, username, email, role, created_at, last_login FROM Users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

/**
 * Cambiar contraseña
 */
export async function changePassword(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const pool = await getPool();

    // Obtener usuario actual
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT * FROM Users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.recordset[0];

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Contraseña incorrecta',
        message: 'La contraseña actual no es correcta'
      });
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña
    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('password_hash', sql.NVarChar, newPasswordHash)
      .query('UPDATE Users SET password_hash = @password_hash WHERE id = @id');

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

/**
 * Logout (opcional - el JWT se invalida en el cliente)
 */
export async function logout(req, res) {
  // En un sistema JWT stateless, el logout se maneja del lado del cliente
  // eliminando el token. Aquí solo retornamos un mensaje de éxito.
  res.json({ message: 'Logout exitoso' });
}
