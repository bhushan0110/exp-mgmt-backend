const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const User = require('../models/User');


router.get('/dashboardData',authenticate,async(req,res) =>{
    try{
        const user = await User.findById({_id: req.user.id});
        const recentItems = await Expense.find({user:req.user.id}).sort({_id: -1}).limit(3);
        const category = await Category.find({ user: req.user.id });
        let date = new Date();
        let month = date.getMonth();


        const monthlyData = await Expense.find({
            date: {
                $gte: new Date(new Date().getFullYear(), month, 1),
                $lt: new Date(new Date().getFullYear(), month + 1, 1),
            },
            user: req.user.id,
        });

        let totalBudget=0;
        let spend=0;

        for(let i=0;i<category.length;i++){
            totalBudget+=category[i].budget;
            spend+=category[i].spend;
        }

        let extra=0;

        if(spend>totalBudget){
            extra = spend-totalBudget;
        }

        const pieNm =[], pieVal = [];

        category.map((element)=>{
            pieNm.push(element.name);
            pieVal.push(element.spend);
        })

        res.status(200).send({recentItems,category,totalBudget,spend, extra, user,pieNm,pieVal});
    }
    catch(err){
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

router.post('/monthlyRecord', authenticate,async(req,res)=>{
    try{
        console.log("INSIDE");
        const date = new Date(req.body.date);
        
        const monthlyData = await Expense.find({
            date: {
                $gte: new Date(date.getFullYear(),date.getMonth()),
                $lt: new Date(date.getFullYear(),date.getMonth()+1),
            },
            user: req.user.id,
        });
        if(monthlyData){
            res.status(200).send(monthlyData);
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send("Internal server errir");
    }
});

router.post('/customRecord',authenticate,async(req,res)=>{
    try{
        const {data} = req.body;
        const {start , end} = data;
        const customData = await Expense.find({
            date: {
                $gte: new Date(start),
                $lte: new Date(end),
            },
            user: req.user.id,
        });

        if(customData){
            res.status(200).send(customData);
        }

    }
    catch(err){
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

router.post('/categoryDetails', async(req,res)=>{
    try{
        const category= req.body.id;
        console.log(req.body);
        const data = await Expense.find({category: category,
            date:{
                $gte: new Date(new Date().getFullYear(),new Date().getMonth()),
                $lt: new Date(new Date().getFullYear(),new Date().getMonth()+1),
            }
        });
        if(data){
            res.status(200).send(data);
            console.log(data);
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server error');
    }
});

router.post('/deleteCategory',authenticate,async(req,res)=>{
    try{
        const id = req.body.catID;
        
        console.log(id);
        const delCat = await Category.findByIdAndDelete({_id:id});
        if(delCat){
            res.status(200).send("Successfully Deleted");
        }
        // const Expenses = await Expense.fin({});
    }
    catch(err){
        console.log(err);
        res.status(500).send("Internal server error");
    }
});



module.exports = router;