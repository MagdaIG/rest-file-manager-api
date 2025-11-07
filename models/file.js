// Modelo de Archivo
// En producción, esto se reemplazaría por una conexión a base de datos

const files = [];

class File {
  static findAll() {
    return files;
  }

  static findById(id) {
    return files.find(f => f.id === id);
  }

  static findByUserId(userId) {
    return files.filter(f => f.uploadedBy === userId);
  }

  static findByUserIdAndId(userId, fileId) {
    return files.find(f => f.id === fileId && f.uploadedBy === userId);
  }

  static create(fileData) {
    const newFile = {
      id: files.length + 1,
      originalName: fileData.originalName,
      fileName: fileData.fileName,
      filePath: fileData.filePath,
      size: fileData.size,
      mimetype: fileData.mimetype,
      uploadedBy: fileData.uploadedBy,
      uploadedAt: new Date().toISOString()
    };
    files.push(newFile);
    return newFile;
  }

  static delete(id) {
    const fileIndex = files.findIndex(f => f.id === id);
    if (fileIndex === -1) {
      return null;
    }
    const file = files[fileIndex];
    files.splice(fileIndex, 1);
    return file;
  }

  static deleteByUserIdAndId(userId, fileId) {
    const fileIndex = files.findIndex(f => f.id === fileId && f.uploadedBy === userId);
    if (fileIndex === -1) {
      return null;
    }
    const file = files[fileIndex];
    files.splice(fileIndex, 1);
    return file;
  }
}

module.exports = File;

