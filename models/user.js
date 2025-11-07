// Modelo de Usuario
// En producción, esto se reemplazaría por una conexión a base de datos

const users = [];

class User {
  static findAll() {
    return users;
  }

  static findById(id) {
    return users.find(u => u.id === id);
  }

  static findByEmail(email) {
    return users.find(u => u.email === email);
  }

  static findByUsername(username) {
    return users.find(u => u.username === username);
  }

  static findByEmailOrUsername(email, username) {
    return users.find(u => u.email === email || u.username === username);
  }

  static create(userData) {
    const newUser = {
      id: users.length + 1,
      username: userData.username,
      email: userData.email,
      password: userData.password, // En producción, hashear la contraseña
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  }

  static update(id, updateData) {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return null;
    }

    const user = users[userIndex];
    if (updateData.username) user.username = updateData.username;
    if (updateData.email) user.email = updateData.email;
    if (updateData.password) user.password = updateData.password; // En producción, hashear
    user.updatedAt = new Date().toISOString();

    users[userIndex] = user;
    return user;
  }

  static delete(id) {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return false;
    }
    users.splice(userIndex, 1);
    return true;
  }
}

module.exports = User;

