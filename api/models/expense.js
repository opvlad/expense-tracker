import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Будь ласка, додайте назву витрати']
    },
    amount: {
        type: Number,
        required: [true, 'Будь ласка, додайте суму витрати']
    },
    date: {
        type: Date,
        required: [true, 'Будь ласка, додайте дату здійснення витрати']
    },
    category: {
        type: String,
        trim: true,
        enum: ['Їжа', 'Розваги', 'Транспорт', 'Житло', 'Здоровʼя', 'Інше', 'Підсумок'],
        required: [true, 'Будь ласка, додайте категорію витрати']
    },
    note: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export default mongoose.model('Expense', ExpenseSchema);