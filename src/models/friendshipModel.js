import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import UserModel from './userModel.js';

dotenv.config();

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(config);

export class FriendshipModel {
  // Enviar solicitud de amistad
  static async sendFriendRequest(userId, friendId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        "INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')",
        [userId, friendId]
      );
      return { success: true, message: "Solicitud de amistad enviada" };
    } catch (error) {
      console.error("Error en sendFriendRequest:", error);
      return { success: false, message: error.message };
    } finally {
      connection.release();
    }
  }

  // Aceptar solicitud de amistad
  static async acceptFriendRequest(requestId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        "UPDATE friendships SET status = 'accepted' WHERE id = ?",
        [requestId]
      );
      return { success: true, message: "Solicitud de amistad aceptada" };
    } catch (error) {
      console.error("Error en acceptFriendRequest:", error);
      return { success: false, message: error.message };
    } finally {
      connection.release();
    }
  }

  // Rechazar solicitud de amistad
  static async declineFriendRequest(requestId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        "UPDATE friendships SET status = 'declined' WHERE id = ?",
        [requestId]
      );
      return { success: true, message: "Solicitud de amistad rechazada" };
    } catch (error) {
      console.error("Error en declineFriendRequest:", error);
      return { success: false, message: error.message };
    } finally {
      connection.release();
    }
  }

  static async getFriends(userId) {
    const connection = await pool.getConnection();
    try {
      // Obtener los friend_id de todas las relaciones donde userId está involucrado y el estado es 'accepted'
      const [rows] = await connection.execute(
        `SELECT 
           CASE 
             WHEN user_id = ? THEN friend_id 
             ELSE user_id 
           END AS friend_id
         FROM friendships
         WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'`,
        [userId, userId, userId]
      );
  
      if (rows.length === 0) return [];
  
      const friendIds = rows.map(row => row.friend_id);
  
      const friends = [];
      for (let friendId of friendIds) {
        const friend = await UserModel.getUserById(friendId);
        if (friend) friends.push(friend);
      }
  
      return friends;
  
    } catch (error) {
      console.error("Error en getFriends:", error);
      return [];
    } finally {
      connection.release();
    }
  }
  

  // Eliminar amistad
  static async removeFriend(userId, friendId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        "DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
        [userId, friendId, friendId, userId]
      );
      return { success: true, message: "Amistad eliminada" };
    } catch (error) {
      console.error("Error en removeFriend:", error);
      return { success: false, message: error.message };
    } finally {
      connection.release();
    }
  }

  // Obtener solicitudes de amistad pendientes
  static async getReceivedRequests(userId) {
    const connection = await pool.getConnection();
    try {
      // Obtener las solicitudes de amistad pendientes donde el estado es 'pending' y el amigo es el usuario
      const [rows] = await connection.execute(
        "SELECT * FROM friendships WHERE friend_id = ? AND status = 'pending'",
        [userId]
      );
      // Aquí vamos a agregar el senderId para cada solicitud
      return rows.map(row => ({
        ...row,
        senderId: row.user_id // Asumimos que 'user_id' es el que envió la solicitud
      }));
    } catch (error) {
      console.error("Error en getReceivedRequests:", error);
      return [];
    } finally {
      connection.release();
    }
  }
  

}

export default FriendshipModel;
