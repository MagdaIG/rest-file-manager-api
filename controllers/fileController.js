// Controlador de Archivos

const File = require('../models/file');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB por defecto

// Subir archivo
const uploadFile = (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
      });
    }

    const uploadedFile = req.files.file;
    
    // Validar tamaño del archivo
    if (uploadedFile.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `El archivo excede el tamaño máximo permitido (${MAX_FILE_SIZE / 1024 / 1024}MB)`
      });
    }

    // Generar nombre único para el archivo
    const fileExtension = path.extname(uploadedFile.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Guardar archivo
    uploadedFile.mv(filePath, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error al guardar el archivo',
          error: err.message
        });
      }

      // Guardar información del archivo
      const fileData = {
        originalName: uploadedFile.name,
        fileName: fileName,
        filePath: filePath,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype,
        uploadedBy: req.user.id
      };

      const fileInfo = File.create(fileData);

      res.status(201).json({
        success: true,
        message: 'Archivo subido exitosamente',
        file: {
          id: fileInfo.id,
          originalName: fileInfo.originalName,
          fileName: fileInfo.fileName,
          size: fileInfo.size,
          mimetype: fileInfo.mimetype,
          uploadedAt: fileInfo.uploadedAt
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al subir archivo',
      error: error.message
    });
  }
};

// Listar archivos del usuario autenticado
const getFiles = (req, res) => {
  try {
    const userFiles = File.findByUserId(req.user.id);
    
    res.status(200).json({
      success: true,
      count: userFiles.length,
      files: userFiles.map(f => ({
        id: f.id,
        originalName: f.originalName,
        fileName: f.fileName,
        size: f.size,
        mimetype: f.mimetype,
        uploadedAt: f.uploadedAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar archivos',
      error: error.message
    });
  }
};

// Obtener información de un archivo específico
const getFileById = (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const file = File.findByUserIdAndId(req.user.id, fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      file: {
        id: file.id,
        originalName: file.originalName,
        fileName: file.fileName,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener archivo',
      error: error.message
    });
  }
};

// Eliminar archivo
const deleteFile = (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const file = File.deleteByUserIdAndId(req.user.id, fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Eliminar archivo del sistema de archivos
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    res.status(200).json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar archivo',
      error: error.message
    });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  getFileById,
  deleteFile
};

