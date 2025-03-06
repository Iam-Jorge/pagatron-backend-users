# Web Systems Development 2025 - UCLM

This project is part of the **Web Systems Development 2025 course** at the University of Castilla-La Mancha (UCLM). The goal of the project is to build a **Peer-to-Peer microtransaction web solution**, and this repository contains the **users backend** implementation.

## Authors

- **Georgi Angelov**
- **Alibek Tugel**


## Technologies Used

- **Node.js**: A runtime environment for executing JavaScript on the server.
- **Express**: A minimalist framework for building web applications in Node.js.
- **Typescript**: A superset of JavaScript that adds static typing and other features.
- **MySQL**: Database used to store user data.


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

To start the application in a production environment:
  - `npm run start`


This will start the Vite development server, and you can view the application in your browser at [http://localhost:3000](http://localhost:3000).
This por can be modified in the `config.js` file.
