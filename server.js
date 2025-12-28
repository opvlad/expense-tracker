import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './api/config/db.js';
import expensesRouter from './api/routers/expenses.js';


dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.set('query parser', 'extended');

app.use(express.json());
app.use('/api/v1/expenses', expensesRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server was started at port: ${PORT}`);
})

