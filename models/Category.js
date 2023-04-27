const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        require: true,
    },
    budget:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now
    }
});

const Category = mongoose.model('Category',CategorySchema);
module.exports = Category;