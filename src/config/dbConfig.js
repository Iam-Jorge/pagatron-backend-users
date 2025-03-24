import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const createDB = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    multipleStatements: true // Permitir múltiples declaraciones SQL
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('Database created or already exists, skipping creation.');
    
    await connection.changeUser({ database: process.env.DB_NAME });
    
    const [rows] = await connection.query('SHOW TABLES');
    const existingTables = rows.map(row => Object.values(row)[0]);
    
    if (existingTables.includes('users') && 
        existingTables.includes('credit_cards') && 
        existingTables.includes('transactions') && 
        existingTables.includes('friendships')) {
      console.log('Tables already exist, skipping creation.');
    } else {
      const scriptPath = path.resolve('src', 'config', 'pagatron.sql');
      const sql = fs.readFileSync(scriptPath, 'utf8');
      await connection.query(sql);
      console.log('Tables initialized');
    }
  } catch (err) {
    console.error('Error during database initialization:', err);
  } finally {
    await connection.end();
  }
};

// Función para obtener una conexión a la base de datos
export const getConnection = async () => {
  return await mysql.createConnection({
    ...config,
    multipleStatements: true
  });
};

// Función para ejecutar consultas
export const query = async (sql, params) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.query(sql, params);
    return results;
  } finally {
    await connection.end();
  }
};