var EPub = require("epub");

var epub = new EPub("1.epub", "/imagewebroot/", "/articlewebroot/");
epub.on("error", function(err){
    console.log("ERROR\n-----");
    throw err;
});

epub.on("end", function(err){
    // console.log("METADATA:\n");
    // console.log(epub.metadata);

    // console.log("\nSPINE:\n");
    // console.log(epub.flow);

    // console.log("\nTOC:\n");
    //console.log(epub.toc);

    // get first chapter
   console.log(epub.spine)
    epub.getChapter(epub.spine.contents[4].id, function(err, data){
        if(err){
            console.log(err);
            return;
        }
        console.log(data); // first 512 bytes
    });

    /*
    epub.getImage(image_id, function(err, data, mimeType){
        console.log(err || data);
        console.log(mimeType)
    });
    */
    
});

epub.parse();
