const User = require("../Models/User");
const jwt = require('jsonwebtoken')


const Authenticate = async (req,res,next )=>{
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
      
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        const user = await User.findById(decoded.userId); 
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        next();
      } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }
}

const Authorize = async (req,res,next)=>{
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
  
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        const user = await User.findById(decoded.userId);
  
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
          }
          if(!user.isVerified){
            return res.status(400).json({
                message: 'User not Verified' 
            })
        }
        if(user.role!='admin'){
            return res.status(401).json({
                message:'You are not authorized'
            })
        }
        
        req.user = user;
        next();
      } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }
}

module.exports = {
    Authenticate,
    Authorize
}