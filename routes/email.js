const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const {google} = require('googleapis');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN});

router.post('/sendEmail', async(req,res)=>{
    try{
      
      const accessToken = await oAuth2Client.getAccessToken();
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
          type: 'OAuth2',
          user: 'baribhushan9120@gmail.com',
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken
        }
      });


      const mailOptions = {
        from: 'Expense-Management@AFour Tech <baribhushan9120@gmail.com>',
        to: 'bhushan.bari@walchandsangli.ac.in',
        subject: 'Test App',
        text: "SUCCESS IN SENDING mail"
      }

      const result  =await transporter.sendMail(mailOptions);
      if(result){
        return res.status(200).send({result});
      }
    }
    catch(err){
      console.log(err);
    }
});

module.exports = router;