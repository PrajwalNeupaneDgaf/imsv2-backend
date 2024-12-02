const mongooose = require('mongoose')

const user = new mongooose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true, 
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
      },
      isVerified:{
          type:'boolean',
          default:false
      }
    },
      {
        timestamps:true
      },
    )

const User = mongooose.model('User',user);

module.exports = User