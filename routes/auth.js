const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const authenticate = require('../middleware/authentication');
const sendMail = require('./email');
// Create a new user

router.get('/',(req,res)=>{
    console.log("auth");
})

router.post('/createUser',
    [
        body('name').isLength({ min: 2 }),
        body('email', "Enter Valid email").isEmail(),
        body('password', 'Must be more than 5 character').isLength({ min: 5 })
    ]
    , async (req, res) => {

        //Express validator validation
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        try {
            //Check email exist or not in DB
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            const salt = await bcrypt.genSalt(10);
            const encryptedPass = await bcrypt.hash(req.body.password,salt);

            const createUser = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: encryptedPass
            });

            const success = await createUser.save();
            const data = {
                user: {
                    id: createUser.id
                }
            };

            const authToken = jwt.sign(data,JWT_SECRET);
            res.json({authToken,success});
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error occured');
        }
    });


router.post('/login',
    [
        body('email','Enter Valid email').isEmail(),
        body('password','Password must be more than 5 char').isLength({min:5})
    ],
    async(req,res)=>{
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({error: error.array()});
        } 

        const {email,password} = req.body;
        try{
            const user = await User.findOne({email:email});
            if(!user){
                return res.status(400).json({error: 'Invalid Credentials'});
            }
            const pass =await  bcrypt.compare(password,user.password);
            if(!pass){
                return res.status(400).json({error: 'Invalid Credentials'});
            }

            const data ={
                user:{
                    id: user.id
                }
            };
            // const authToken = jwt.sign(data,JWT_SECRET);
            const authToken = jwt.sign({ data, exp: Math.floor(Date.now() / 1000) + 2*(60 * 60) }, secret);
            res.json({authToken});
        }
        catch(err){
            console.log(err);
            res.status(500).send('Error occured'); 
        }
    }
);

router.post('/resetPassword', authenticate,[
    body('password').isLength({min:5}),
] ,async(req,res) =>{
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({error: error.array()});
    }
    try{
        const salt = await bcrypt.genSalt(10);
        const encryptedPass = await bcrypt.hash(req.body.password,salt);
        const reset = await User.findOneAndUpdate({_id: req.user.id}, {password: encryptedPass});
        if(!reset){
            console.log(reset);
            return res.status(500).json({error: 'Internal server error'});
        }

        res.status(200).json({reset});
    }
    catch(error){
        console.log(error);
        res.status(500).send('Error occured');
    }
});

router.post('/forgotPassword', async (req,res)=>{
    const email = req.body.email;
    try{
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(400).json({ error: 'Email not registered' });
        }
        const newPass = `${Math.floor(Math.random()*10000)}+Afour`;
        
        const success = await sendMail(email,newPass);
        if(!success){
            return res.status(500).send("Internal server error");
        }
        const salt = await bcrypt.genSalt(10);
        const encryptedPass = await bcrypt.hash(newPass,salt);
        const reset = await User.findOneAndUpdate({_id: req.user.id}, {password: encryptedPass});

        return res.status(200).json({success});
    }
    catch(err){
        console.log(err);
        res.status(500).send('Error occured');
    }
});


module.exports = router;