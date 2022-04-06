const express = require("express");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const nodepub = require('nodepub');
f = require('util').format
const user = 'citizix';
const password = 'S3cret';
const url = f('mongodb://%s:%s@localhost:27017',user, password);

const MongoClient = require('mongodb').MongoClient;
const { exec } = require("child_process");  
const zmq = require("zeromq"),
  sock = zmq.socket("push");

sock.bindSync("tcp://127.0.0.1:3001");
console.log("Producer bound to port 3000");

const app = express();
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
  let bookId = req.params.id
  const ObjectId = require('mongodb').ObjectId; 
  const o_id = new ObjectId(bookId);
  const client = new MongoClient(url);
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db("elib");
  const collection = db.collection('books');
  console.log(bookId)
  const findResult = await collection.find({_id:o_id}).toArray();
  console.log(findResult[0]['filename']);
  let title = req.body.title
  let author = req.body.author
  let cover = req.body.cover
  let publisher = req.body.publisher
  let isbn = req.body.isbn
  let tags = req.body.tags


  let cmd = f("ebook-meta ./epub/%s --title %s --authors=%s --cover=%s  --publisher=%s --isbn=%s --tags=%s",
  findResult[0]['filename'],
  "sdasdasdsa",
  "rhysha",
  "test.jpg",
  "PentaGlobal",
  "id:859432",
  "world,hello")
  console.log(cmd)
  await exec(cmd, (error, stdout, stderr) => {console.log(stdout)});

  res.json({status:true,result:"Meta Updated for "+findResult[0]['filename']})
});



const port = process.env.PORT || 5003;

app.listen(port, function () {
  console.log("Listening on " + port);
});