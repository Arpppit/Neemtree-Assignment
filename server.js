const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const datamodel = require('./model')
const reader = require('xlsx');
const MongoClient = require('mongodb').MongoClient
const app = express();
const port = process.env.PORT || 8000;

//PASTE YOUR MONGODB CONNECTION STRING HERE
const connectionString = "mongodb+srv://Arp:Arppit1234@cluster0.02d5e.mongodb.net/Cluster0?retryWrites=true&w=majority"



app.listen(port, function() {
    console.log(`listening on ${port}`)
  }) 
 
  
  app.use(fileUpload());

 
  // app.get('/', (req, res) => {
  //   res.send('Hello World')
  // })
  
  //THIS FUNCTIONS READS FROM EXCEL FILE SAVED IN /STATIC AND WRITES IT ON DATABASE 
   async function saveToDb(fname){
    MongoClient.connect(connectionString, { useUnifiedTopology: true,useNewUrlParser: true })
    .then(client => {
      console.log('[SUCCESS]:Connected to Database')
      const db = client.db('Add_from_E')
      const excelCollection = db.collection('excel_data')
      const execfile = reader.readFile(`./static/${fname}`)
      let data = []
      
    const sheets = execfile.SheetNames
    for(let i = 0; i < sheets.length; i++)
    {
       const temp = reader.utils.sheet_to_json(
            execfile.Sheets[execfile.SheetNames[0]])
       temp.forEach((res) => {
        const newModel = new datamodel({
          name: res['Name of the Candidate'],
          email: res['Email'],
          mob:res['Mobile No.'],
          dob:res['Date of Birth'],
          workexp:res['Work Experience'],
          resumetitle:res['Resume Title'],
          location:res['Current Location'],
          address:res['Postal Address'],
          currentE:res['Current Employer'],
          designation: res['Current Designation']
        });
        
        
        excelCollection.insertOne(newModel).then(result => {
          console.log('[SUCCESS]: data uploaded to mongodb ')
        })
        .catch(error => console.error(error))
  
          data.push(res)
          
       })
      
    }
    excelCollection.aggregate([
      {
          "$group": {
              _id: {name: "$name"},
              dups: { $addToSet: "$_id" } ,
              count: { $sum : 1 }
          }
      },
      {
          "$match": {
              count: { "$gt": 1 }
          }
      }
     ]).forEach(function(doc) {
        doc.dups.shift();
        excelCollection.deleteOne({
            _id: {$in: doc.dups}
        });
     })
    })
    .catch(error => console.error(error))

   
  }




  //THIS FUNCTION RECIEVES FILE SENT FROM FRONTEND AND SAVE IT TO ./STATIC FOLDER
  app.post('/upload', (req, res, next ) => {
    if(!req.files){
      return res.status(400).json({msg: "No file uploaded"});
  }

    //Reading file from request object
  const file = req.files.file;
  console.log('[RECIEVED]',file)
  const path =`${__dirname}/static/${file.name}`;
  try {
      if(!fs.existsSync(path)){
          file.mv(path, err=>{
              if(err){
                  console.log(err);
                  return res.status(500).send(err);
              }});
      }}catch(err){
      }
      
    saveToDb(file.name);

    });
