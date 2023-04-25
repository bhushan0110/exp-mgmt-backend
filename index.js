const express = require('express');
const connectToDB = require('./db');
require('dotenv').config({path:'./env'});


connectToDB(); // Connect to DB

const app = express();
const port = 5000;

app.use(express.json());
//Available routes
app.use('/auth',require('./routes/auth'));

app.get('/', (req,res) =>{
    res.send("Hello Backend here");
});

// Assigning Port to app 
app.listen(port,()=>{
    console.log(`Server started , app listing at port ${port}`);
});