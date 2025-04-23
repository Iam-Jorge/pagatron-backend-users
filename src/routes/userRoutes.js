import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { TransactionController } from '../controllers/transactionController.js';
import { FriendshipController } from '../controllers/friendshipController.js';
export const userRouter = Router();

// USERS
userRouter.get('/', (req, res) => {
  res.send("En usuarios");
});
userRouter.get('/getAll', UserController.getAll);
userRouter.get('/getUserById/:id', UserController.getUserById);
userRouter.get('/getUserByEmail/:email', UserController.getUserByEmail);
userRouter.post('/login', UserController.login);
userRouter.post('/register', UserController.register);
userRouter.put('/update/:id', UserController.updateUser);
userRouter.delete('/delete/:id', UserController.deleteUser);
userRouter.post('/logout', UserController.logout);
userRouter.post('/validateUserKey', UserController.validateUserKey);
userRouter.post('/checkEmailExists', UserController.checkEmailExists);


// TRANSACTIONS
userRouter.post('/request-money', TransactionController.requestMoney);
userRouter.post('/accept-money/:transactionId', TransactionController.acceptMoneyRequest);
userRouter.get('/transactions', TransactionController.getAllTransactions);
userRouter.get('/transactions/user', TransactionController.getTransactionsByEmail);
userRouter.post('/revoke-transaction/:transactionId', TransactionController.revokeTransaction);
userRouter.get('/pending-requests', TransactionController.getPendingRequests);
userRouter.post('/accept-request/:requestId', TransactionController.acceptRequest);
userRouter.post('/decline-request/:requestId', TransactionController.declineRequest);
userRouter.post('/send-money', TransactionController.sendMoney);
userRouter.get('/sent-requests', TransactionController.getSentRequests);
userRouter.get('/received-requests', TransactionController.getReceivedRequests);

// FRIENDSHIPS
userRouter.post('/friendship/send-friend-request', FriendshipController.sendFriendRequest);
userRouter.post('/friendship/accept-friend-request/:requestId', FriendshipController.acceptFriendRequest);
userRouter.post('/friendship/decline-friend-request/:requestId', FriendshipController.declineFriendRequest);
userRouter.get('/friendship/friends/:userEmail', FriendshipController.getFriends);
userRouter.delete('/friendship/remove-friend/:userId/:friendId', FriendshipController.removeFriend);
userRouter.get('/friendship/received-requests/:userEmail', FriendshipController.getReceivedRequests);