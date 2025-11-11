import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './app/config';
import { errorHandler } from './core/errors';
import { logger } from './core/logger';
import routes from './modules';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS
  app.use(cors(config.cors));

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));
  }

  // Routes
  app.use('/api', routes);

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'MBG Inventory Management System API',
      version: '1.0.0',
      status: 'running',
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.path,
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
