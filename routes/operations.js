const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication');
const Expense = require('../models/Expense');
const Category = require('../models/Category');


// Route to calculate mothly expense category wise and over all
router.get('/mothlyExpenseRecord', authenticate, async (req, res) => {
    try {
        let date = new Date();
        let month = date.getMonth();

        //get expense for loggedin user for current month
        const monthlyData = await Expense.find({
            date: {
                $gte: new Date(new Date().getFullYear(), month, 1),
                $lt: new Date(new Date().getFullYear(), month + 1, 1),
            },
            user: req.user.id,
        });

        if (!monthlyData) {
            return res.status(201).send("No data for this month");
        }

        const category = await Category.find({ user: req.user.id });

        let totalExpense = 0;           //Store total expense for month
        let category_expense = {};      //Object to store category wise expense
        let totalBudget = 0;            //Total Budget
        let category_budget = {};       //Object to store category wise budget
        let extraExpence = 0;           // Total extra expense
        let extraExpence_category = {}; //Category waise extra expense

        //Initiallised object with value zero
        for (let index = 0; index < category.length; index++) {
            category_expense[`${category[index]._id}`] = 0;
            totalBudget += category[index].budget;
            extraExpence_category[`${category[index]._id}`] = 0;
            //Calculating category wise budget
            if (category_budget[`${category[index]._id}`]) {
                category_budget[`${category[index]._id}`] += category[index].budget;
            } else {
                category_budget[`${category[index]._id}`] = category[index].budget;
            }
        }

        //Calculation of expense
        for (let index = 0; index < monthlyData.length; index++) {
            totalExpense += monthlyData[index].amount;
            category_expense[`${monthlyData[index].category}`] += monthlyData[index].amount;
        }

        //Total extra expence
        if (totalExpense > totalBudget) {
            extraExpence = totalExpense - totalBudget;
        }

        //Calculation of category wise extra expense 
        for (let key in category_budget) {
            if (category_budget[key] < category_expense[key]) {
                extraExpence_category[key] = category_expense[key] - category_budget[key];
            }
        }

        res.json({ totalExpense, category_expense, totalBudget, category_budget, extraExpence, extraExpence_category });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

router.get('/weeklyExpenseRecord', authenticate, async (req, res) => {
    try {
        //query to get expense data for specified week
        const weeklyData = await Expense.find({ 
            date:{
                $gte: new Date(new Date().getFullYear(), month, 1),
                $lt: new Date(new Date().getFullYear(), month + 1, 1), 
            },
            week: week, 
            user: req.user.id });
        if (!weeklyData) {
            return res.status(201).send("No data for this week");
        }
        const category = await Category.find({ user: req.user.id });

        let totalExpense = 0;           //Store total expense for week
        let category_expense = {};      //Object to store category wise expense
        let totalBudget = 0;            //Total Budget
        let category_budget = {};       //Object to store category wise budget
        let extraExpence = 0;           // Total extra expense
        let extraExpence_category = {}; //Category waise extra expense

        //Initiallised object with value zero
        for (let index = 0; index < category.length; index++) {
            category_expense[`${category[index]._id}`] = 0;
            totalBudget += category[index].budget;
            extraExpence_category[`${category[index]._id}`] = 0;
            //Calculating category wise budget
            if (category_budget[`${category[index]._id}`]) {
                category_budget[`${category[index]._id}`] += category[index].budget;
            } else {
                category_budget[`${category[index]._id}`] = category[index].budget;
            }
        }

        //Calculation of expense
        for (let index = 0; index < weeklyData.length; index++) {
            totalExpense += weeklyData[index].amount;
            category_expense[`${weeklyData[index].category}`] += weeklyData[index].amount;
        }

        //Total extra expence
        if (totalExpense > totalBudget) {
            extraExpence = totalExpense - totalBudget;
        }

        //Calculation of category wise extra expense 
        for (let key in category_budget) {
            if (category_budget[key] < category_expense[key]) {
                extraExpence_category[key] = category_expense[key] - category_budget[key];
            }
        }

        res.json({ totalExpense, category_expense, totalBudget, category_budget, extraExpence, extraExpence_category });

    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;