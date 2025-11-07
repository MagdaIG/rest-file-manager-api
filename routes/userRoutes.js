// Rutas de Usuarios

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

// POST /api/users/register - Registrar nuevo usuario
router.post('/register', userController.register);

// POST /api/users/login - Login de usuario
router.post('/login', userController.login);

// GET /api/users/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, userController.getProfile);

// PUT /api/users/profile - Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, userController.updateProfile);

module.exports = router;

