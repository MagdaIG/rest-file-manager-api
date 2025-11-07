// Servidor principal de la aplicación
// API REST para gestión de archivos con autenticación JWT

const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB por defecto

// Asegurar que el directorio de uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: MAX_FILE_SIZE },
  createParentPath: true
}));
app.use(express.static('public'));

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Directorio de uploads: ${UPLOAD_DIR}`);
});
