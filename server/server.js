import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import billRoutes from './routes/billRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/accounts',accountRoutes);
app.use('/api/budget', budgetRoutes);

app.get('/', function(req, res) {
  res.send('SpendWise API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});