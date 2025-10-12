import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from '#routes/auth.routes.js';
import usersRouter from '#routes/user.routes.js';
import authMiddleware from '#middleware/auth.middleware.js';
import securityMiddleware from '#middleware/security.middleware.js';
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.use(authMiddleware);
if (process.env.NODE_ENV === 'production') {
  app.use(securityMiddleware);
}
app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions!');

  res.status(200).send('Hello from Acquisitions!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Acquisitions API is running!' });
});
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

export default app;
