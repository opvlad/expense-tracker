import express from 'express';
import { getExpenses, createExpense, deleteExpense, changeExpense } from '../controllers/expense.js';

const router = express.Router();

router.route('/')
    .get(getExpenses)
    .post(createExpense);

router.route('/:id')
    .delete(deleteExpense)
    .patch(changeExpense);

export default router;