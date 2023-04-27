const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const authenticate = require('../middleware/authentication');

router.post('/addCategory', authenticate, [
    body('budget').isNumeric({ min: 100 })     //Using express-validator
], async (req, res) => {

    // Validating input
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    //Destructure variables
    const { name, budget } = req.body;

    try {
        //Check if category exist or not
        const exist = await Category.findOne({ name: name, user: req.user.id });
        if (exist) {
            return res.status(400).json({ error: 'Category already exist' });
        }

        //Create new Category object
        const createCategory = await Category.create({
            name,
            budget,
            user: req.user.id
        });

        //Save to DB
        const success = await createCategory.save();
        if (success) {
            return res.status(200).json({ success });
        }
    }
    catch (error) {
        console.log(err);
        res.status(500).send('Error occured');
    }
});


router.post('/addExpense', authenticate,[
    body('amount').isNumeric({ min: 1 }),
    body('info').isLength({ min: 1 })       //Validate Expense
], async (req, res) => {
    // Validating input
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    //Destructure
    const { amount, info, category } = req.body;
    try {
        //Create new expense
        const month = new Date().getMonth();
        const newExpense = await Expense.create({
            amount,
            info,
            category,
            user: req.user.id,
            month
        });

        //Save to DB
        const success = await newExpense.save();
        if (success) {
            return res.status(200).json({ success, newExpense });
        }
    }
    catch (error) {
        console.log(err);
        res.status(500).send('Error occured');
    }
});


module.exports = router;