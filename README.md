# Web Systems Development 2025 - UCLM

This project is part of the **Web Systems Development 2025 course** at the University of Castilla-La Mancha (UCLM). The goal of the project is to build a **Peer-to-Peer microtransaction web solution**, and this repository contains the **users backend** implementation.

## Authors

- **Georgi Angelov**
- **Alibek Tugel**


## Building the Project
To set up and build the project, first clone this repository and then install the necessary dependencies.

1. **Clone the repository**:
  - `git clone <URL_OF_REPOSITORY>`
  - `cd <directory_name>`

2. **Install dependencies**:  
  - `Run the following command to install all required dependencies:`
  - `npm install`

## Running the Project

Once the dependencies are installed, you can run the project in development mode to see active changes:
  - `npm run dev`

This will start the Vite development server, and you can view the application in the browser at [http://localhost:3000](http://localhost:3000).
This por can be modified in the `config.js` file.

To start the application in a production environment:
  - `npm run start`


### Dependencies

- **express**: Framework for building REST APIs.
  - `npm install express`

- **mysql2:** MySQL driver for Node.js.
  - `npm install mysql2`

- **dotenv**: The entry point for React DOM rendering.
  - `npm install dotenv`

- **cors**: Middleware to enable CORS in the API.
  - `npm install cors`

- **jsonwebtoken**: Authorization JSON Web Token.
  - `npm install jsonwebtoken`

- **bcryptjs**: Library used for password hashing.
  - `npm install bcryptjs` 
  
- **cookie-parser**: Parses cookies and puts the cookie information on req object in the middleware.
  - `npm install cookie-parser` 


# API Routes Documentation

## User Management

| Method | Path | Controller |
|:------:|------|------------|
| 🟢 **GET** | `/getAll` | `UserController.getAll` |
| 🟢 **GET** | `/getUserById/:id` | `UserController.getUserById` |
| 🟢 **GET** | `/getUserByEmail/:email` | `UserController.getUserByEmail` |
| 🟠 **POST** | `/login` | `UserController.login` |
| 🟠 **POST** | `/register` | `UserController.register` |
| 🔵 **PUT** | `/update/:id` | `UserController.updateUser` |
| 🔴 **DELETE** | `/delete/:id` | `UserController.deleteUser` |
| 🟠 **POST** | `/logout` | `UserController.logout` |
| 🟠 **POST** | `/validateUserKey` | `UserController.validateUserKey` |
| 🟠 **POST** | `/checkEmailExists` | `UserController.checkEmailExists` |

## Transactions

| Method | Path | Controller |
|:------:|------|------------|
| 🟠 **POST** | `/request-money` | `TransactionController.requestMoney` |
| 🟠 **POST** | `/accept-money/:transactionId` | `TransactionController.acceptMoneyRequest` |
| 🟢 **GET** | `/transactions` | `TransactionController.getAllTransactions` |
| 🟢 **GET** | `/transactions/user` | `TransactionController.getTransactionsByEmail` |
| 🟠 **POST** | `/revoke-transaction/:transactionId` | `TransactionController.revokeTransaction` |
| 🟢 **GET** | `/pending-requests` | `TransactionController.getPendingRequests` |
| 🟠 **POST** | `/accept-request/:requestId` | `TransactionController.acceptRequest` |
| 🟠 **POST** | `/decline-request/:requestId` | `TransactionController.declineRequest` |
| 🟠 **POST** | `/send-money` | `TransactionController.sendMoney` |
| 🟢 **GET** | `/sent-requests` | `TransactionController.getSentRequests` |
| 🟢 **GET** | `/received-requests` | `TransactionController.getReceivedRequests` |

## Friendships

| Method | Path | Controller |
|:------:|------|------------|
| 🟠 **POST** | `/friendship/send-friend-request` | `FriendshipController.sendFriendRequest` |
| 🟠 **POST** | `/friendship/accept-friend-request/:requestId` | `FriendshipController.acceptFriendRequest` |
| 🟠 **POST** | `/friendship/decline-friend-request/:requestId` | `FriendshipController.declineFriendRequest` |
| 🟢 **GET** | `/friendship/friends/:userEmail` | `FriendshipController.getFriends` |
| 🔴 **DELETE** | `/friendship/remove-friend/:userId/:friendId` | `FriendshipController.removeFriend` |
| 🟢 **GET** | `/friendship/received-requests/:userEmail` | `FriendshipController.getReceivedRequests` |