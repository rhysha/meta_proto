var express = require("express");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');


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

app.post('/search', async (req, res) => {
  // try {
  //console.log(req.files)
  
});

var port = process.env.PORT || 5003;

app.listen(port, function () {
  console.log("Listening on " + port);
});