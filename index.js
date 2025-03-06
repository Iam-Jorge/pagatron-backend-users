import express, { json } from 'express';
import { PORT } from './src/config/config.js';
import { userRouter } from './src/routes/userRoutes.js';
import { corsMiddleware } from './src/middlewares/cors.js';
import { createDB } from './src/config/dbConfig.js'; 

const app = express();

app.use(express.json())
app.use(corsMiddleware())
app.disable('x-powered-by')
app.use('/users', userRouter)

{ /* This functions checks and creates the scheme and tables */ }
{ /* createDB(); */ }

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
