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

// DELETE /api/users/profile - Eliminar usuario autenticado
router.delete('/profile', authenticateToken, userController.deleteUser);

// GET /api/users/avatars/defaults - Obtener avatares predeterminados
router.get('/avatars/defaults', authenticateToken, userController.getDefaultAvatars);

// POST /api/users/avatar/upload - Subir avatar personalizado
router.post('/avatar/upload', authenticateToken, userController.uploadAvatar);

// POST /api/users/avatar/select - Seleccionar avatar predeterminado
router.post('/avatar/select', authenticateToken, userController.selectDefaultAvatar);

// DELETE /api/users/avatar - Eliminar avatar
router.delete('/avatar', authenticateToken, userController.deleteAvatar);

module.exports = router;

