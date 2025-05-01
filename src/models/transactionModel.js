import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// DB connection config
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,  // Ajusta este valor según tus necesidades
  queueLimit: 0
};

// Crear pool de conexiones en lugar de una única conexión
const pool = mysql.createPool(config);

// Log de actividad de conexiones para monitoreo
pool.on('acquire', function (connection) {
  console.log('Conexión %d adquirida', connection.threadId);
});

pool.on('release', function (connection) {
  console.log('Conexión %d liberada', connection.threadId);
});

export class transactionModel {
  // TRANSACTIONS
  static async requestMoney(sender_email, recipient_email, amount, message = '') {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        "INSERT INTO transactions (sender_email, recipient_email, amount, message, status) VALUES (?, ?, ?, ?, 'pending')",
        [sender_email, recipient_email, amount, message]
      );
      return { success: true, message: "Solicitud de dinero enviada" };
    } catch (error) {
      console.error('Error en requestMoney:', error);
      return { success: false, message: "Error al enviar la solicitud: " + error.message };
    } finally {
      connection.release(); // Siempre liberar la conexión
    }
  }

  // ACCEPT TRANSACTION
  static async acceptMoneyRequest(transactionId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [transaction] = await connection.execute(
            "SELECT * FROM transactions WHERE id = ? AND status = 'pending' FOR UPDATE",
            [transactionId]
        );

        if (!transaction.length) {
            await connection.rollback();
            return { success: false, message: "Transacción no encontrada o ya procesada" };
        }

        const { sender_email, recipient_email, amount } = transaction[0];
        const [payerCards] = await connection.execute(
            "SELECT * FROM creditcards WHERE user_email = ? FOR UPDATE",
            [recipient_email]
        );

        if (!payerCards.length || parseFloat(payerCards[0].balance) < parseFloat(amount)) {
            await connection.rollback();
            return { success: false, message: "Saldo insuficiente" };
        }

        // Quitar dinero al destinatario (quien paga)
        await connection.execute(
            "UPDATE creditcards SET balance = balance - ? WHERE user_email = ?",
            [amount, recipient_email]
        );

        // Dar dinero al remitente (quien solicitó)
        await connection.execute(
            "UPDATE creditcards SET balance = balance + ? WHERE user_email = ?",
            [amount, sender_email]
        );

        // Marcar transacción como completada
        await connection.execute(
            "UPDATE transactions SET status = 'completed' WHERE id = ?",
            [transactionId]
        );

        await connection.commit();
        return { success: true, message: "Solicitud aceptada y dinero transferido al remitente" };

    } catch (error) {
        await connection.rollback();
        console.error('Error en acceptMoneyRequest:', error);
        return { success: false, message: "Error al procesar la solicitud: " + error.message };
    } finally {
        connection.release();
    }
  }


  // GET ALL TRANSACTIONS
  static async getAllTransactions() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute("SELECT * FROM transactions");
      return rows;
    } catch (error) {
      console.error('Error en getAllTransactions:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // GET TRANSACTION BY EMAIL
  static async getTransactionsByEmail(userEmail) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM transactions WHERE sender_email = ? OR recipient_email = ?",
        [userEmail, userEmail]
      );
      return rows;
    } catch (error) {
      console.error('Error en getTransactionsByEmail:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // REVOKE TRANSACTION
  static async revokeTransaction(transactionId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [transaction] = await connection.execute(
        "SELECT * FROM transactions WHERE id = ? FOR UPDATE",
        [transactionId]
      );
      
      if (!transaction.length) {
        await connection.rollback();
        return { success: false, message: "Transacción no encontrada" };
      }
      
      // Solo revocar si no está completada
      if (transaction[0].status === 'completed') {
        // Si ya está completada, podríamos implementar una reversión
        // Este es un ejemplo simple, en un caso real necesitarías crear una nueva transacción
        const { sender_email, recipient_email, amount } = transaction[0];
        
        await connection.execute(
          "UPDATE creditcards SET balance = balance + ? WHERE user_email = ?", 
          [amount, sender_email]
        );
        
        await connection.execute(
          "UPDATE creditcards SET balance = balance - ? WHERE user_email = ?", 
          [amount, recipient_email]
        );
      }
      
      await connection.execute(
        "UPDATE transactions SET status = 'revoked' WHERE id = ?", 
        [transactionId]
      );
      
      await connection.commit();
      return { success: true, message: "Transacción revocada por el administrador" };
    } catch (error) {
      await connection.rollback();
      console.error('Error en revokeTransaction:', error);
      return { success: false, message: "Error al revocar la transacción: " + error.message };
    } finally {
      connection.release();
    }
  }

  // DECLINE REQUEST
  static async declineRequest(requestId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [transaction] = await connection.execute(
        "SELECT * FROM transactions WHERE id = ? AND status = 'pending' FOR UPDATE",
        [requestId]
      );

      if (!transaction.length) {
        await connection.rollback();
        return { success: false, message: "Transacción no encontrada o ya procesada" };
      }

      await connection.execute(
        "UPDATE transactions SET status = 'declined' WHERE id = ?", 
        [requestId]
      );
      
      await connection.commit();
      return { success: true, message: "Solicitud rechazada" };
    } catch (error) {
      await connection.rollback();
      console.error('Error en declineRequest:', error);
      return { success: false, message: "Error al rechazar la solicitud: " + error.message };
    } finally {
      connection.release();
    }
  }

  // GET PENDING REQUESTS
  static async getPendingRequests(userEmail) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM transactions WHERE recipient_email = ? AND status = 'pending'",
        [userEmail]
      );
      return rows;
    } catch (error) {
      console.error('Error en getPendingRequests:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // ACCEPT REQUEST
  static async acceptRequest(requestId) {
    const connection = await pool.getConnection();
    try {
      console.log("Transacción iniciada.");

      // Iniciar transacción
      await connection.beginTransaction();

      // Obtener la transacción pendiente
      const [transaction] = await connection.execute(
        "SELECT * FROM transactions WHERE id = ? AND status = 'pending' FOR UPDATE",
        [requestId]
      );
      
      console.log("Transacción obtenida:", transaction);

      if (!transaction.length) {
        await connection.rollback();
        console.log("Transacción no encontrada o ya procesada.");
        return { success: false, message: "Transacción no encontrada o ya procesada" };
      }

      const { sender_email, recipient_email, amount } = transaction[0];
      console.log(`Transacción encontrada. Remitente: ${sender_email}, Destinatario: ${recipient_email}, Monto: ${amount}`);

      // Verificar saldo con bloqueo de filas
      const [senderCards] = await connection.execute(
        "SELECT * FROM creditcards WHERE user_email = ? FOR UPDATE",
        [sender_email]
      );
      console.log("Tarjetas del remitente obtenidas:", senderCards);

      if (!senderCards.length) {
        await connection.rollback();
        console.log(`No se encontraron tarjetas para el remitente con email: ${sender_email}`);
        return { success: false, message: "No se encontraron tarjetas para el remitente" };
      }

      const senderCard = senderCards[0]; // Suponiendo que la primera tarjeta es la principal
      console.log(`Saldo de la tarjeta del remitente: ${senderCard.balance}`);

      // Convertir tanto el saldo como el monto a números para la comparación
      const senderBalance = parseFloat(senderCard.balance);  // Convertimos a número
      const transactionAmount = parseFloat(amount);  // Convertimos a número

      console.log(`Saldo (convertido) de la tarjeta del remitente: ${senderBalance}`);
      console.log(`Monto (convertido) de la transacción: ${transactionAmount}`);

      if (senderBalance < transactionAmount) {
        await connection.rollback();
        console.log(`Saldo insuficiente en la tarjeta del remitente. Necesita: ${transactionAmount}, disponible: ${senderBalance}`);
        return { success: false, message: "Saldo insuficiente en la tarjeta del remitente" };
      }

      // Realizar la transferencia de dinero
      await connection.execute(
        "UPDATE creditcards SET balance = balance - ? WHERE user_email = ?", 
        [transactionAmount, recipient_email]
      );
      
      await connection.execute(
        "UPDATE creditcards SET balance = balance + ? WHERE user_email = ?", 
        [transactionAmount, sender_email]
      );

      // Marcar la transacción como completada
      await connection.execute(
        "UPDATE transactions SET status = 'completed' WHERE id = ?", 
        [requestId]
      );

      await connection.commit();
      console.log("Solicitud aceptada y dinero transferido.");
      return { success: true, message: "Solicitud aceptada y dinero transferido" };

    } catch (error) {
      await connection.rollback();
      console.error('Error en acceptRequest:', error);
      return { success: false, message: "Error al aceptar la solicitud: " + error.message };
    } finally {
      connection.release();
      console.log("Conexión liberada.");
    }
}

  
  

  // SEND MONEY
  static async sendMoney(sender_email, recipient_email, amount, message = '') {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar saldo con bloqueo
      const [senderCards] = await connection.execute(
        "SELECT * FROM creditcards WHERE user_email = ? FOR UPDATE",
        [sender_email]
      );

      if (!senderCards.length || senderCards[0].balance < amount) {
        await connection.rollback();
        return { success: false, message: "Saldo insuficiente" };
      }

      await connection.execute(
        "INSERT INTO transactions (sender_email, recipient_email, amount, message, status) VALUES (?, ?, ?, ?, 'completed')",
        [sender_email, recipient_email, amount, message]
      );

      await connection.execute(
        "UPDATE creditcards SET balance = balance - ? WHERE user_email = ?", 
        [amount, sender_email]
      );

      await connection.execute(
        "UPDATE creditcards SET balance = balance + ? WHERE user_email = ?", 
        [amount, recipient_email]
      );

      await connection.commit();
      return { success: true, message: "Transferencia realizada con éxito" };
    } catch (error) {
      await connection.rollback();
      console.error('Error en sendMoney:', error);
      return { success: false, message: "Error al enviar dinero: " + error.message };
    } finally {
      connection.release();
    }
  }

  // GET SENT REQUESTS
  static async getSentRequests(sender_email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM transactions WHERE sender_email = ? AND status = 'pending'",
        [sender_email]
      );
      return rows;
    } catch (error) {
      console.error('Error en getSentRequests:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // GET RECEIVED REQUESTS
  static async getReceivedRequests(recipient_email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM transactions WHERE recipient_email = ? AND status = 'pending'",
        [recipient_email]
      );
      return rows;
    } catch (error) {
      console.error('Error en getReceivedRequests:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // GET BALANCE
  static async getBalance(user_email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT balance FROM creditcards WHERE user_email = ?",
        [user_email]
      );

      if (rows.length > 0) {
        return { success: true, balance: rows[0].balance };
      }
      return { success: false, message: "Usuario no encontrado" };
    } catch (error) {
      console.error('Error en getBalance:', error);
      return { success: false, message: "Error al obtener el saldo: " + error.message };
    } finally {
      connection.release();
    }
  }

  // GET CARDS BY EMAIL
  static async getCardsByEmail(user_email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM creditcards WHERE user_email = ?",
        [user_email]
      );
      return rows;
    } catch (error) {
      console.error('Error en getCardsByEmail:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default transactionModel;