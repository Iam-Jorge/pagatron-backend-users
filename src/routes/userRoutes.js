import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

export const userRouter = Router();

// ROOT
userRouter.get('/', (req, res) => {
  res.send("En usuarios");
});

// GET ALL USERS
userRouter.get('/getAll', UserController.getAll);

// GET USER BY ID
userRouter.get('/getUserById/:id', UserController.getUserById);

// GET USER BY EMAIL
userRouter.get('/getUserByEmail/:email', UserController.getUserByEmail);

// LOGIN
userRouter.post('/login', UserController.login);

// REGISTER
userRouter.post('/register', UserController.register);

// UPDATE USER
userRouter.put('/update/:id', UserController.updateUser);

// DELETE USER
userRouter.delete('/delete/:id', UserController.deleteUser);

// LOGOUT
userRouter.post('/logout', UserController.logout);

// VALIDATE USER KEY (ROL)
userRouter.post('/validateUserKey', UserController.validateUserKey);