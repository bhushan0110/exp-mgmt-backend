const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication');
const Expense = require('../models/Expense');
const Category = require('../models/Category');


// Route to calculate mothly expense category wise and over all
router.get('/mothlyExpense',authenticate,async(req,res)=>{
    try{
        let date = new Date();
        let month= date.getMonth();
        
        const monthlyData = await Expense.find({
            month: month,
            user: req.user.id,
        });

        if(!monthlyData){
            res.status(201).send("No data for this month");
        }

        const category = await Category.find({user:req.user.id});
        let totalExpense = 0;
        let category_expense ={};

        for(let index=0; index<category.length;index++){
            category_expense[`${category[index]._id}`] =0;
        }

        for(let index=0;index<monthlyData.length;index++){
            totalExpense+= monthlyData[index].amount;
            category_expense[`${monthlyData[index].category}`]+=monthlyData[index].amount;
        }


        res.json({totalExpense,category_expense});
    }
    catch(err){
        console.log(err);
        res.status(500).send("Internal server error");
    }
})


module.exports = router;