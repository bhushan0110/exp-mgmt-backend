const mongoose = require('mongoose');

const uri = process.env.DB;

const connectToDB = () =>{
    mongoose.connect(uri).then(()=>{
        console.log("Connected to DB success");
    })
    .catch((err)=> {
        console.log(err);
    })
};

module.exports = connectToDB;