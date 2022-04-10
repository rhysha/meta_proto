// worker.js
var zmq = require("zeromq"),
  sock = zmq.socket("pull");
var MongoClient = require('mongodb').MongoClient;
const ebookConverter = require('node-ebook-converter');
const epubParser = require('epub-metadata-parser');
f = require('util').format,
sock.connect("tcp://127.0.0.1:3002");
console.log("Worker connected to port 3000");
var user = 'citizix';
var password = 'S3cret';
var url = f('mongodb://%s:%s@localhost:27017',
  user, password);
const { exec } = require("child_process");  

var MongoClient = require('mongodb').MongoClient;


sock.on("message", async function (msg) {
  console.log("work: %s", msg.toString());
  // convertion
  await ebookConverter.convert({
    input: "./uploads/" + msg.toString(),
    output: "./epub/" + msg.toString() + ".epub"
  }).then(response => console.log("CONVERTING"))
    .catch(error => console.error("ERROR",error));
  // parse
  epubParser.parse("./epub/"+msg.toString()+".epub" , './doc/', book => {
    console.log(book);
    console.log(book.author,book.title,book.subject,book.language,book.pubdate,book.fileName);
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("elib");
      var bookJson = { author: book.author, title: book.title, subject:book.subject, language:book.language, pubdate: book.pubdate,filename: book.fileName};
      dbo.collection("books").insertOne(bookJson, function(err, res) {
        if (err) throw err;
        console.log("1 book inserted");
        db.close();
      });
    });
  });
 
  // save in db

});
