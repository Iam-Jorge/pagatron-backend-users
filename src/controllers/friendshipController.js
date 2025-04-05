import FriendshipModel from "../models/friendshipModel.js";
import UserModel from "../models/userModel.js";

export class FriendshipController {
  // Enviar solicitud de amistad
  static async sendFriendRequest(req, res) {
    const { userEmail, friendEmail } = req.body;
    
    try {
      if (!userEmail || !friendEmail) {
        return res.status(400).json({
          success: false,
          message: 'userEmail y friendEmail deben ser definidos'
        });
      }
      
      // Buscar los usuarios por correo electrónico
      const sender = await UserModel.getUserByEmail(userEmail);
      const recipient = await UserModel.getUserByEmail(friendEmail);
      
      // Verificar si ambos usuarios existen
      if (!sender || !recipient) {
        return res.status(404).json({ 
          success: false, 
          message: 'Uno o ambos usuarios no existen.' 
        });
      }
      
      // Usar el modelo con los IDs resueltos
      const result = await FriendshipModel.sendFriendRequest(sender.id, recipient.id);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error en sendFriendRequest:", error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  }
  
  // Aceptar solicitud de amistad
  static async acceptFriendRequest(req, res) {
    const { requestId } = req.params;
    
    try {
      const result = await FriendshipModel.acceptFriendRequest(requestId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error al aceptar solicitud de amistad:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
  }
  
  // Rechazar solicitud de amistad
  static async declineFriendRequest(req, res) {
    const { requestId } = req.params;
    
    try {
      const result = await FriendshipModel.declineFriendRequest(requestId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error al rechazar solicitud de amistad:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
  }

  // Obtener amigos de un usuario por email
  static async getFriends(req, res) {
    const { userEmail } = req.params;
  
    try {
      // Obtener el usuario por email
      const user = await UserModel.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      }
  
      // Obtener los amigos del usuario con el ID obtenido
      const friends = await FriendshipModel.getFriends(user.id);
      return res.status(200).json(friends);
  
    } catch (error) {
      console.error('Error al obtener amigos:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
  }

  // Eliminar un amigo
  static async removeFriend(req, res) {
    const { userId, friendId } = req.params;
  
    // Comprobamos que ambos parámetros existan
    if (!userId || !friendId) {
      return res.status(400).json({ success: false, message: 'Faltan datos para eliminar la amistad.' });
    }
  
    try {
      // Convertimos los valores de userId y friendId a enteros antes de pasarlos al modelo
      const result = await FriendshipModel.removeFriend(parseInt(userId), parseInt(friendId));
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error al eliminar amigo:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
  }
  
  

  // Obtener solicitudes de amistad recibidas
  static async getReceivedRequests(req, res) {
    const { userEmail } = req.params;
  
    try {
      const user = await UserModel.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      }
  
      // Obtener las solicitudes de amistad pendientes para el usuario
      const requests = await FriendshipModel.getReceivedRequests(user.id);
  
      // Agregar el correo del remitente a cada solicitud de amistad
      const requestsWithSenderInfo = await Promise.all(requests.map(async (request) => {
        const sender = await UserModel.getUserById(request.senderId); // O si tienes un campo para obtener el senderId
        return {
          ...request,
          senderEmail: sender ? sender.email : 'Desconocido',  // Asegúrate de que el email esté incluido
          senderName: sender ? sender.name : 'Desconocido',    // Si también necesitas el nombre
        };
      }));
  
      return res.status(200).json(requestsWithSenderInfo);
    } catch (error) {
      console.error('Error al obtener solicitudes recibidas:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
  }
  
}

export default FriendshipController;
