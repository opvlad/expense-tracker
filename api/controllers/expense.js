import Expense from '../models/expense.js';

const sendError = (status, error) => {
    return res.status(status).json({
        success: false,
        error
    }); 
}


export const getExpenses = async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        excludedFields.forEach(key => delete queryObj[key]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        const filter = JSON.parse(queryStr);
        const { sort } = req.query;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const expenses = await Expense.find(filter).sort(sort).skip(skip).limit(limit);
        const total = await Expense.countDocuments(filter);

        return res.status(200).json({
            success: true,
            count: expenses.length,
            total: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: expenses
        });
    } catch (error) {
        return sendError(500, error);
    }
}

export const createExpense = async (req, res) => {
    try {
        const { title, amount, category, note, date } = req.body;

        const expense = await Expense.create({
            title,
            amount,
            category,
            note,
            date
        });

        return res.status(201).json({
            success: true,
            data: expense
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return sendError(400, error)
        }

        return sendError(500, error);
    }
}

export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        await Expense.deleteOne(expense);

        return res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return sendError(400, error);
        }
        
        return sendError(500, error);
    }
}

export const changeExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const update = req.body;
        console.log({update}, {id});
        const result = await Expense.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            return sendError(400, error);
        }
        
        return sendError(500, error);
    }
}
