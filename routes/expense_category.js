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
            user: req.user.id,
            spend: 0
        });

        //Save to DB
        const success = await createCategory.save();
        if (success) {
            return res.status(200).json({ success });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Error occured');
    }
});


router.post('/addExpense', authenticate,[
    body('amount').isNumeric({ min: 1 }),
    body('info').isLength({ min: 1 }),       //Validate Expense
], async (req, res) => {
    // Validating input
    console.log(req.body);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array()});
    }
    
    //Destructure
    const { amount, info, category,date} = req.body;

    //get week
    const d = new Date(date);
    let adjustedDate = d.getDate()+d.getDay();
    let prefixes = ['0', '1', '2', '3', '4', '5'];
    let week= parseInt(prefixes[0 | adjustedDate / 7])+1;

    try {
        const cat = await Category.findById({_id:category, user: req.user.id});
        let spend = parseInt(cat.spend);
        spend+= parseInt(amount);
        let x = new Date();
        if(d.getMonth()===x.getMonth()){
            console.log("IN");
            await Category.findOneAndUpdate({_id:category},{spend:spend});
        }
        //Create new expense
        const month = d.getMonth();
        const newExpense = await Expense.create({
            amount,
            info,
            category,
            user: req.user.id,
            date,
            week
        });

        //Save to DB
        const success = await newExpense.save();
        if (success) {
            return res.status(200).json({ success, newExpense });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Error occured');
    }
});

//Route to get catergory

router.get('/getCategory',authenticate, async (req,res) =>{
    try{
        const category= await Category.find({user: req.user.id});
        if(category){
            console.log(category);
            return res.status(200).json(category);
        }
        else{
            return res.status(200).json({nodata:"No data"});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send("Internal Server error");
    }
});

module.exports = router;