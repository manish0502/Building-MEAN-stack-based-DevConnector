const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:{
      type : String,
      required : true
  } ,
  email :{
      type :String,
      required : true,
      unique: true
  },
  password: {
      type : String,
      required : true
  },
  //it will help you to attach your profile with the email without even realising
  avatar :{
      type : String
  },
  date : {
      type : Date,
      default: Date.now
  }
});

//model it 
// const User = mongoose.model('user',UserSchema);
// module.exports= User

//Alternative for Model

module.exports= User = mongoose.model('user',UserSchema);;