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
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  }

  // REGISTER
  static async register(req, res) {
    const { name, email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (await emailExists(email, UserModel)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Aquí se crea una nueva instancia de la entidad User
    const user = new User(null, name, email, hashedPassword, 'user');

    await UserModel.createUser(user);  // Pasamos la entidad User al modelo

    res.status(201).json({ message: 'User registered successfully' });
  }

  // LOGOUT
  static async logout(req, res) {
    res.status(200).json({ message: 'Logout successful' });
  }
}
