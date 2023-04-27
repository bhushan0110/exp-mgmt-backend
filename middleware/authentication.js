const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Bhushan1exp1mgmt1';

const authenticate = async (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Access Denied"});
    }

    try{
        const data = await jwt.verify(token,JWT_SECRET);
        req.user = data.user;
        next();
    }
    catch(error){
        res.status(401).send({error:"Error occured"});
    }
}

module.exports = authenticate;