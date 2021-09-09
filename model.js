const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const datamodel = new Schema({
  
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mob:{
    type: String
    
  },
  dob:{
    type: String
    
  },
  workexp:{
    type: String
    
  },
  resumetitle:{
    type: String
    
  },
  location:{
    type: String
    
  },
  address:{
    type: String
    
  },
  currentE:{
    type: String
    
  },
  designation:{
    type: String
    
  },

});

module.exports = Post = mongoose.model('datamodel', datamodel);