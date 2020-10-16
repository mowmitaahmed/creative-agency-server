const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
// const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pweys.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res)=>{
    res.send('Hello, from DB!');
});

const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
client.connect(err => {

  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");
  

  console.log('DB Connected!');

//   Services
  
  app.post('/addservices', (req, res)=>{
      const file = req.files.file;
      const title = req.body.title;
      const description = req.body.description;

          const newImg = file.data;
          const encImg =  newImg.toString('base64');

          var image = {
              contentType: file.mimetype,
              size: file.size,
              img: Buffer.from(encImg, 'base64')
          }
          serviceCollection.insertOne({title, description, image})
          .then( result => {
                  res.send(result.insertedCount> 0);
          })
  });

  app.get('/serviceList', (req, res)=>{
      serviceCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
  });


//   Orders

  app.post('/addorders', (req, res)=>{
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const service = req.body.service;
    const projectDetails = req.body.projectDetails;
    const price = req.body.price;
    const orderDate = req.body.orderDate;
    const status = req.body.status;

        const newImage = file.data;
        const encImage =  newImage.toString('base64');

        var imageOrder = {
            contentTypeOrder: file.mimetype,
            sizeOrder: file.size,
            imgOrder: Buffer.from(encImage, 'base64')
        }
        orderCollection.insertOne({name, email, service, projectDetails, price, imageOrder, orderDate , status})
        .then( result => {
             res.send(result.insertedCount> 0);
        })
});


app.get('/orderList', (req, res)=>{
    orderCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
});

// Customers Orders
app.get('/customerOrderList', (req, res)=>{
    orderCollection.find({email: req.query.email})
    .toArray((err, documents) => {
        res.send(documents);
    })
});

app.patch('/update/:id', (req, res)=>{
    console.log(req.params.id);
    console.log(req.body);
    orderCollection.updateOne({_id: ObjectId(req.params.id)},{
        $set: {
            status: req.body.status
        }
    }).then(result => res.send(result.modifiedCount > 0))
})

// Reviews

app.post('/addreviews', (req, res)=>{
    console.log(req.body);
  const name = req.body.name;
  const designation = req.body.designation;
  const description = req.body.description;
  const img = req.body.img;

      reviewCollection.insertOne({name, designation, description, img})
      .then( result => {
          res.send(result.insertedCount > 0);
      })
      console.log(name, designation, description, img);
  })


  app.get('/reviewList', (req, res)=>{
    reviewCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
  });

//   Admins
  app.post('/addadmins', (req, res)=> {
    const email = req.body.email;
    adminCollection.insertOne({email})
    .then( result => {
        res.send(result.insertedCount > 0);
    })
  });

  app.get('/adminList', (req, res)=>{

    adminCollection.find({email: req.query.email})
    .toArray( (err, result) => {
       res.send(result);
    })
});

});


app.listen(process.env.PORT || port);