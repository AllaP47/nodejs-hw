import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongoDB } from './db/connectMongoDB.js';
import notesRouter from './routes/notesRoutes.js'; 
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(logger); 
app.use(cors()); 
app.use(express.json()); 


app.use(notesRouter);


app.use(notFoundHandler);
app.use(errorHandler);


const startServer = async () => {
  try {
    await connectMongoDB(); 

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('⛔ Server failed to start due to DB connection error:', error);
    process.exit(1);
  }
};


startServer();

