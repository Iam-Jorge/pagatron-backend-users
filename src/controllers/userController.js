import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.js';
import UserModel from '../models/userModel.js';
import { validatePassword, validateEmail, emailExists } from './validation.js';

export class UserController {

  // GET ALL USERS
  static async getAll(req, res) {
    const users = await UserModel.getAll();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.json(users);
  }

  // GET USER BY ID
  static async getUserById(req, res) {
    const { id } = req.params;
    const user = await UserModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  }
  
  // GET USER BY EMAIL
  static async getUserByEmail(req, res) {
    const { email } = req.params;
    const user = await UserModel.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  }

  // LOGIN
  static async login(req, res) {
    const { email, password } = req.body;
        
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
        
    const user = await UserModel.getUserByEmail(email);
        
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
        
    const passwordMatch = await validatePassword(password, user.password_hash);
        
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
        
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
        
    // Configurar la cookie con el token
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hora en milisegundos
      sameSite: 'strict'
    });
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }

  // REGISTER
  static async register(req, res) {
    const { name, email, password, role, userKey } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (await emailExists(email, UserModel)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Validación del USER_KEY
    let assignedRole = 'user';
    if (role === 'admin') {
      if (!userKey || userKey !== process.env.USER_KEY) {
        return res.status(403).json({ message: 'Invalid admin key' });
      }
      assignedRole = 'admin';
    }

    const user = new User(null, name, email, hashedPassword, assignedRole);
    const newUserId = await UserModel.createUser(user);

    const token = jwt.sign(
      { id: newUserId, email: user.email, role: assignedRole },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict'
    });

    res.status(201).json({ message: 'User registered successfully', role: assignedRole });
  }

  // UPDATE USER
  static async updateUser(req, res) {
    const { id } = req.params;
    const { name, email, newPassword, currentPassword, role } = req.body;
  
    const existingUser = await UserModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const userData = {};
  
    if (name) userData.name = name;
  
    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
  
      if (email !== existingUser.email) {
        const userWithEmail = await UserModel.getUserByEmail(email);
        if (userWithEmail && userWithEmail.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
  
      userData.email = email;
    }
  
    if (newPassword) {
      const match = await bcrypt.compare(currentPassword, existingUser.password_hash);
      if (!match) {
        return res.status(400).json({ message: 'Contraseña actual incorrecta' });
      }
  
      userData.password_hash = await bcrypt.hash(newPassword, 10);
    }
  
    if (role) {
      userData.role = role;
    }
  
    const updated = await UserModel.updateUser(id, userData);
  
    if (updated) {
      res.status(200).json({ message: "User updated successfully", updatedUser: userData });
    } else {
      res.status(400).json({ message: "Failed to update user" });
    }
  }
  

  // DELETE USER
  static async deleteUser(req, res) {
    const { id } = req.params;
    
    const existingUser = await UserModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const deleted = await UserModel.deleteUser(id);
    
    if (deleted) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(400).json({ message: "Failed to delete user" });
    }
  }

  // LOGOUT
  static async logout(req, res) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'Strict',
    });
    
    res.status(200).json({ message: 'Logout successful' });
  }

  // VALIDATE USER_KEY (ROL)
  static async validateUserKey(req, res) {
    try {
      const { userKey } = req.body; // Capturar la clave enviada desde el frontend
      if (!userKey) {
        return res.status(400).json({ valid: false, message: "USER_KEY is required" });
      }

      // Comparar con la clave almacenada en las variables de entorno
      if (userKey === process.env.USER_KEY) {
        return res.status(200).json({ valid: true });
      } else {
        return res.status(403).json({ valid: false, message: "Invalid USER_KEY" });
      }
    } catch (error) {
      res.status(500).json({ valid: false, message: "Error validating USER_KEY", error: error.message });
    }
  }

}