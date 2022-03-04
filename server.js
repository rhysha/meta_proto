var express = require("express");

var app = express();
//app.use(express.logger());

app.get('/', function(request, response)
{
  var epubParser = require('epub-metadata-parser');
  epubParser.parse('./2.epub', './doc/' , book => {
      console.log(book);
  });
});

var port = process.env.PORT || 5003;

app.listen(port, function()
{
  console.log("Listening on " + port);
});