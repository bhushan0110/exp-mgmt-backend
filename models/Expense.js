const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        require: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        require: true,
    },
    info:{
        type: String,
        require: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    month:{
        type: Number,
        required: true, 
    },
    date:{
        type: Date,
        default: Date.now
    }
});

const Expense = mongoose.model('Expense',ExpenseSchema);
module.exports = Expense;