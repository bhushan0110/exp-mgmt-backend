const express = require('express');
const connectToDB = require('./db');
require('dotenv').config();
const cors = require('cors');
connectToDB(); // Connect to DB

const app = express();
const port = 5000;

//CORS
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  
app.use(express.json());
//Available routes
app.use('/auth',require('./routes/auth'));
app.use('/expense',require('./routes/expense_category'));
app.use('/query',require('./routes/operations'));
app.use('/mail',require('./routes/email'));


app.get('/', (req,res) =>{
    res.send("Hello Backend here");
});

// Assigning Port to app 
app.listen(port,()=>{
    console.log(`Server started , app listing at port ${port}`);
});