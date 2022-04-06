var express = require("express");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
var nodepub = require('nodepub');
f = require('util').format
var user = 'citizix';
var password = 'S3cret';
var url = f('mongodb://%s:%s@localhost:27017',
  user, password);

var MongoClient = require('mongodb').MongoClient;
const { exec } = require("child_process");  
var zmq = require("zeromq"),
  sock = zmq.socket("push");

sock.bindSync("tcp://127.0.0.1:3001");
console.log("Producer bound to port 3000");

var app = express();
//app.use(express.logger());
// enable files upload
app.use(fileUpload({
  createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true, parameterLimit: 1000000 }))
app.use(morgan('dev'));

app.post('/upload', async (req, res) => {
  // try {
  //console.log(req.files)
  if (!req.files) {
    res.send({
      status: false,
      message: 'No file uploaded'
    });
  } else {
    let file = req.files.book;
    file.mv('./uploads/' + file.name);
    sock.send(file.name);
    res.send({
      stauts: true,
      message: "Successfull"
    })
  }
});

app.get('/book', async (req, res) => {
  // try {
  //console.log(req.files)
  
  const client = new MongoClient(url);
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db("elib");
  const collection = db.collection('books');
  const findResult = await collection.find({}).toArray();
  console.log('Found documents =>', findResult);
  res.json({status:true,results:findResult})
});

app.post('/book/:id/meta', async (req, res) => {
  // try {
  //console.log(req.files)
  let cmd = f("ebook-meta %s -t %s","epub/Alice-in-Wonderland.pdf.epub","Hello World")
  exec(cmd, (error, stdout, stderr) => {});
  
  res.json({status:true})
});



var port = process.env.PORT || 5003;

app.listen(port, function () {
  console.log("Listening on " + port);
});