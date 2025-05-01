import { Transaction } from '../entities/transaction.js';
import TransactionModel from '../models/transactionModel.js';


export class TransactionController {
    static async requestMoney(req, res) {
        const { sender_email, recipient_email, amount, message } = req.body;
        const result = await TransactionModel.requestMoney(sender_email, recipient_email, amount, message);
        res.json(result);
    }

    static async acceptMoneyRequest(req, res) {
        const { transactionId } = req.params;
        const result = await TransactionModel.acceptMoneyRequest(transactionId);
        res.json(result);
    }

    static async getAllTransactions(req, res) {
        const transactions = await TransactionModel.getAllTransactions();
        res.json(transactions);
    }

    static async getTransactionsByEmail(req, res) {
        const { user_email } = req.query;
        const transactions = await TransactionModel.getTransactionsByEmail(user_email);
        res.json(transactions);
    }

    static async revokeTransaction(req, res) {
        const { transactionId } = req.params;
        const result = await TransactionModel.revokeTransaction(transactionId);
        res.json(result);
    }

    // Obtener solicitudes pendientes
    static async getPendingRequests(req, res) {
        const { user_email } = req.query;
        if (!user_email) {
            return res.status(400).json({ error: "El correo del usuario es necesario" });
        }

        const requests = await TransactionModel.getPendingRequests(user_email);
        res.json(requests);
    }

    // Aceptar solicitud de dinero
    static async acceptRequest(req, res) {
      const { requestId } = req.params;
      console.log('acceptRequest requestId:', requestId);

      const result = await TransactionModel.acceptRequest(requestId);
      console.log('acceptRequest result:', result);

      if (!result.success) {
          console.log('acceptRequest error:', result.message);
          return res.status(400).json({ error: result.message });
      }

      res.json({ message: result.message });
    }

    // Rechazar solicitud de dinero
    static async declineRequest(req, res) {
        const { requestId } = req.params;
        const result = await TransactionModel.declineRequest(requestId);
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }

        res.json({ message: result.message });
    }
    
    // SEND MONEY
    static async sendMoney(req, res) {
        const { sender_email, recipient_email, amount, message } = req.body;
      
        if (!sender_email || !recipient_email || amount <= 0) {
          return res.status(400).json({ error: "Datos de transferencia inválidos" });
        }
      
        const result = await TransactionModel.sendMoney(sender_email, recipient_email, amount, message);
      
        if (!result.success) {
          return res.status(400).json({ error: result.message });
        }
      
        res.json({ message: result.message });
    }

    // GET SENT MONEY REQUESTS
    static async getSentRequests(req, res) {
        const { user_email } = req.query;
        
        if (!user_email) {
          return res.status(400).json({ error: "El correo del usuario es necesario" });
        }
    
        try {
          const sentRequests = await TransactionModel.getSentRequests(user_email);
          
          if (sentRequests.length === 0) {
            return res.status(200).json([]); // Return empty array instead of 404
          }
    
          res.status(200).json(sentRequests);
        } catch (error) {
          console.error('Error al obtener solicitudes enviadas:', error);
          res.status(500).json({ error: 'Error al obtener solicitudes enviadas' });
        }
      }

  // GET RECEIVED MONEY REQUESTS
  static async getReceivedRequests(req, res) {
    const { user_email } = req.query;
    
    if (!user_email) {
      return res.status(400).json({ error: "El correo del usuario es necesario" });
    }

    try {
      const receivedRequests = await TransactionModel.getReceivedRequests(user_email);
      
      if (receivedRequests.length === 0) {
        return res.status(200).json([]); // Return empty array instead of 404
      }

      res.status(200).json(receivedRequests);
    } catch (error) {
      console.error('Error al obtener solicitudes recibidas:', error);
      res.status(500).json({ error: 'Error al obtener solicitudes recibidas' });
    }
  }

}