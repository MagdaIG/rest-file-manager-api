// Rutas de Archivos

const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authenticateToken = require('../middleware/auth');

// POST /api/files/upload - Subir archivo (protegida)
router.post('/upload', authenticateToken, fileController.uploadFile);

// GET /api/files - Listar archivos del usuario autenticado
router.get('/', authenticateToken, fileController.getFiles);

// GET /api/files/:id - Obtener información de un archivo específico
router.get('/:id', authenticateToken, fileController.getFileById);

// DELETE /api/files/:id - Eliminar archivo (protegida)
router.delete('/:id', authenticateToken, fileController.deleteFile);

module.exports = router;

