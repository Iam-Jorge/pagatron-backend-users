import mysql from 'mysql2/promise';
import { User } from '../entities/user.js'
import dotenv from 'dotenv';

dotenv.config();

// DB connection config
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Creates the connection to the DB
const connectToDB = async () => {
  try {
    const connection = await mysql.createConnection(config);
    console.log('Connection established to the database');
    return connection;
  } catch (err) {
    console.error('Error connecting to the database', err);
    throw err;
  }
};

export class UserModel {
  static connection;

  // Starts the connection to the DB
  static async initializeConnection() {
    if (!UserModel.connection) {
      UserModel.connection = await connectToDB();
    }
  }

  // GET ALL USERS
  static async getAll() {
    await UserModel.initializeConnection();
    const [users] = await UserModel.connection.query('SELECT * FROM users');
    return users.map(user => new User(user.id, user.name, user.email, user.password_hash, user.role, user.created_at));
  }

  // GET USER BY ID
  static async getUserById(id) {
    await UserModel.initializeConnection();
    const [userById] = await UserModel.connection.query('SELECT * FROM users WHERE id = ?', [id]);
    if (userById.length === 0) return null;
    const user = userById[0];
    return new User(user.id, user.name, user.email, user.password_hash, user.role, user.created_at);
  }

  // GET USER BY EMAIL
  static async getUserByEmail(email) {
    await UserModel.initializeConnection();
    if (!email) return null;
    const loweCaseEmail = email.toLowerCase();
    const [userByEmail] = await UserModel.connection.query('SELECT * FROM users WHERE email = ?', [loweCaseEmail]);
    if (userByEmail.length === 0) return null;
    const user = userByEmail[0];
    return new User(user.id, user.name, user.email, user.password_hash, user.role, user.created_at);
  }

  // CREATE USER
  static async createUser(userData) {
    await UserModel.initializeConnection();
    const { name, email, password_hash, role } = userData;
    const query = 'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)';
    const [result] = await UserModel.connection.query(query, [name, email, password_hash, role]);
    return result.insertId;
  }

  // UPDATE USER
  static async updateUser(id, userData) {
    await UserModel.initializeConnection();
    const { name, email, role } = userData;
    
    let updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email.toLowerCase());
    }
    
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    
    if (userData.password_hash) {
      updates.push('password_hash = ?');
      values.push(userData.password_hash);
    }
    
    if (updates.length === 0) {
      return false;
    }
    
    values.push(id);
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await UserModel.connection.query(query, values);
    
    return result.affectedRows > 0;
  }

  // DELETE USER
  static async deleteUser(id) {
    await UserModel.initializeConnection();
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await UserModel.connection.query(query, [id]);
    return result.affectedRows > 0;
  }
}

export default UserModel;