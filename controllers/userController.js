// Controlador de Usuarios

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const AVATAR_DIR = process.env.AVATAR_DIR || path.join(__dirname, '../public/avatars');
const DEFAULT_AVATARS_DIR = path.join(AVATAR_DIR, 'defaults');
const USER_AVATARS_DIR = path.join(AVATAR_DIR, 'users');

// Asegurar que los directorios de avatares existen
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}
if (!fs.existsSync(DEFAULT_AVATARS_DIR)) {
  fs.mkdirSync(DEFAULT_AVATARS_DIR, { recursive: true });
}
if (!fs.existsSync(USER_AVATARS_DIR)) {
  fs.mkdirSync(USER_AVATARS_DIR, { recursive: true });
}

// Helper para formatear URL de avatar
function formatAvatarUrl(avatarPath) {
  if (!avatarPath) return null;
  return `/avatars/${avatarPath}`;
}

// Registrar nuevo usuario
const register = (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validación básica
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos (username, email, password)'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = User.findByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o email ya existe'
      });
    }

    // Crear nuevo usuario
    const newUser = User.create({ username, email, password });

    // Generar JWT
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: formatAvatarUrl(newUser.avatar)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// Login de usuario
const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const user = User.findByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: formatAvatarUrl(user.avatar)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al hacer login',
      error: error.message
    });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: formatAvatarUrl(user.avatar),
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// Actualizar perfil del usuario autenticado
const updateProfile = (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.user.id;

    // Validar que al menos un campo se proporcione
    if (!username && !email && !password) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar al menos un campo para actualizar (username, email, password)'
      });
    }

    // Verificar si el usuario existe
    const existingUser = User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si se actualiza el email, verificar que no esté en uso por otro usuario
    if (email && email !== existingUser.email) {
      const emailExists = User.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso por otro usuario'
        });
      }
    }

    // Si se actualiza el username, verificar que no esté en uso por otro usuario
    if (username && username !== existingUser.username) {
      const usernameExists = User.findByUsername(username);
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso'
        });
      }
    }

    // Actualizar usuario
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    const updatedUser = User.update(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: formatAvatarUrl(updatedUser.avatar),
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// Eliminar usuario
const deleteUser = (req, res) => {
  try {
    const userId = req.user.id;
    const user = User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Eliminar avatar personalizado si existe
    if (user.avatar && user.avatar.startsWith('users/')) {
      const avatarPath = path.join(AVATAR_DIR, user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Eliminar usuario
    const deleted = User.delete(userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Error al eliminar usuario'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

// Obtener avatares predeterminados
const getDefaultAvatars = (req, res) => {
  try {
    const defaultAvatars = [];
    const files = fs.readdirSync(DEFAULT_AVATARS_DIR);
    
    files.forEach(file => {
      if (file.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        defaultAvatars.push({
          id: file.replace(/\.[^/.]+$/, ''),
          url: `/avatars/defaults/${file}`,
          name: file
        });
      }
    });

    res.status(200).json({
      success: true,
      avatars: defaultAvatars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener avatares predeterminados',
      error: error.message
    });
  }
};

// Subir avatar personalizado
const uploadAvatar = (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo de avatar'
      });
    }

    const avatar = req.files.avatar;
    const userId = req.user.id;
    const user = User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(avatar.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'
      });
    }

    // Validar tamaño (máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (avatar.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Tamaño máximo: 2MB'
      });
    }

    // Eliminar avatar anterior si existe y es personalizado
    if (user.avatar && user.avatar.startsWith('users/')) {
      const oldAvatarPath = path.join(AVATAR_DIR, user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Generar nombre único para el archivo
    const fileExtension = path.extname(avatar.name);
    const fileName = `user_${userId}_${Date.now()}${fileExtension}`;
    const filePath = path.join(USER_AVATARS_DIR, fileName);

    // Guardar archivo
    avatar.mv(filePath, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error al guardar el avatar',
          error: err.message
        });
      }

      // Actualizar usuario con nuevo avatar
      const avatarUrl = `users/${fileName}`;
      const updatedUser = User.update(userId, { avatar: avatarUrl });

      const fullAvatarUrl = formatAvatarUrl(avatarUrl);
      res.status(200).json({
        success: true,
        message: 'Avatar subido exitosamente',
        avatar: fullAvatarUrl,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: fullAvatarUrl
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al subir avatar',
      error: error.message
    });
  }
};

// Seleccionar avatar predeterminado
const selectDefaultAvatar = (req, res) => {
  try {
    const { avatarId } = req.body;
    const userId = req.user.id;
    const user = User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!avatarId) {
      return res.status(400).json({
        success: false,
        message: 'ID de avatar requerido'
      });
    }

    // Verificar que el avatar predeterminado existe
    const avatarPath = path.join(DEFAULT_AVATARS_DIR, `${avatarId}.png`);
    const avatarPathJpg = path.join(DEFAULT_AVATARS_DIR, `${avatarId}.jpg`);
    const avatarPathSvg = path.join(DEFAULT_AVATARS_DIR, `${avatarId}.svg`);
    
    let avatarFile = null;
    if (fs.existsSync(avatarPath)) {
      avatarFile = `${avatarId}.png`;
    } else if (fs.existsSync(avatarPathJpg)) {
      avatarFile = `${avatarId}.jpg`;
    } else if (fs.existsSync(avatarPathSvg)) {
      avatarFile = `${avatarId}.svg`;
    }

    if (!avatarFile) {
      return res.status(404).json({
        success: false,
        message: 'Avatar predeterminado no encontrado'
      });
    }

    // Eliminar avatar personalizado si existe
    if (user.avatar && user.avatar.startsWith('users/')) {
      const oldAvatarPath = path.join(AVATAR_DIR, user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Actualizar usuario con avatar predeterminado
    const avatarUrl = `defaults/${avatarFile}`;
    const updatedUser = User.update(userId, { avatar: avatarUrl });

    const fullAvatarUrl = formatAvatarUrl(avatarUrl);
    res.status(200).json({
      success: true,
      message: 'Avatar seleccionado exitosamente',
      avatar: fullAvatarUrl,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: fullAvatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al seleccionar avatar',
      error: error.message
    });
  }
};

// Eliminar avatar
const deleteAvatar = (req, res) => {
  try {
    const userId = req.user.id;
    const user = User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene avatar para eliminar'
      });
    }

    // Eliminar archivo de avatar personalizado si existe
    if (user.avatar.startsWith('users/')) {
      const avatarPath = path.join(AVATAR_DIR, user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Actualizar usuario eliminando avatar
    const updatedUser = User.update(userId, { avatar: null });

    res.status(200).json({
      success: true,
      message: 'Avatar eliminado exitosamente',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: formatAvatarUrl(updatedUser.avatar)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar avatar',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteUser,
  getDefaultAvatars,
  uploadAvatar,
  selectDefaultAvatar,
  deleteAvatar
};

