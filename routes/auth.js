const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Bhushan1exp1mgmt1';
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

            const pass = bcrypt.compare(password,user.password);
            if(!pass){
                return res.status(400).json({error: 'Invalid Credentials'});
            }

            const data ={
                user:{
                    id: user.id
                }
            };
            const authToken = jwt.sign(data,JWT_SECRET);
            res.json({authToken});
        }
        catch(err){
            console.log(err);
            res.status(500).send('Error occured'); 
        }
    }
)

module.exports = router;