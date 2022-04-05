var express = require("express");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const epubParser = require('epub-metadata-parser');
const ebookConverter = require('node-ebook-converter');
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
app.get('/', function (request, response) {
  epubParser.parse("./epub/The-Secret-Adversary.epub", './doc/', book => {
    console.log(book);
  });
});
app.post('/upload', async (req, res) => {
 // try {
    //console.log(req.files)
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let file = req.files.book;

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      file.mv('./uploads/' + file.name);
      sock.send(file.name);
      res.send({
        stauts:true,
        message: "Book Uploaded"
      })
      // await ebookConverter.convert({
      //   input: "./uploads/" + file.name,
      //   output: "./epub/" + file.name + ".epub"
      // }).then(response => console.log(response))
      //   .catch(error => console.error(error));


      // epubParser.parse("./epub/" + file.name + ".epub", './doc/', book => res.json(book));
      //send response
     
    }
  // } catch (err) {
  //   res.status(500).send(err);
  // }
});
var port = process.env.PORT || 5003;

app.listen(port, function () {
  console.log("Listening on " + port);
});