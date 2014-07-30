
/**
 * Module dependencies.
 */

//included modules
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var storage = require('./routes/storage');
var blobs = require('./routes/blobs');
var http = require('http');
var path = require('path');
var azure = require('azure');
var azureTable = require('azure-table-node');

var app = express();

 //set azure blob credentials
azureTable.setDefaultClient({
    accountUrl: 'http://[accountName].table.core.windows.net/',
    accountName: '[accountName]',
    accountKey: '[accountKey]'
});



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));



// check for development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



//routing
app.get('/', routes.index);
app.get('/storage', storage.storage);
//list blobs
app.get('/blobs', blobs.blobs);
app.get('/users', user.list);

//create azure table
app.get("/createTable", function (req, res) {

    var client = azureTable.getDefaultClient();
    client.createTable('testtable', function (err, data) {
    });

    client.insertEntity('testtable', {
        PartitionKey: 'tests',
        RowKey: '1',
        value1: 'ABCDEFG'
    }, function (err, data) {
        res.write("Got error :-( " + err);
    });

    res.end("Table created.");
});


//display azire table
app.get("/displayTable", function (req, res) {

    var client = azureTable.getDefaultClient();

    client.queryEntities('testtable', {
        query: azureTable.Query.create('PartitionKey', '==', 'tests') 

    }, function (err, data, continuation) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Got error :-( " + err);
            res.end("");
            return;
        }

        var json = JSON.stringify(data);
        res.writeHead(200, { 'Content-Type': 'text/plain' })

        res.end("Table displayed: " + json);
       });

});


//list all azure tables
app.get("/listTables", function (req, res) {    

    var client = azureTable.getDefaultClient();

    client.listTables(function (err, data, continuation) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write("Got error :-( " + err);
            res.end("");
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' })

        for (var i = 0; i < data.length; i++) {
            res.write("Table[" + i + "]: " + data[i] + " " );
        }       

        res.end("Tables listed." + data);
    });

});

//delete azure table
app.get("/deleteTable", function (req, res) {

    var client = azureTable.getDefaultClient();
    client.deleteTable('testtable', function (err, data) {
    });
    res.end("Table testtable has been deleted.");

});


//download azure blob storage cotent
app.get('/downloadBlob', function (req, res) {
    res.send(
    '<form action="/downloadBlob" method="post" >' +
    '<input type="text" name="blobFile" value="C:\\temp" />' +
    '<input type="submit" value="Download" />' +
    '</form>'
);
});

app.post('/downloadBlob', function (req, res) {
    var fs = require('fs');
    
    if (!fs.existsSync) {
        fs.existsSync = require('path').existsSync;
    }
    var destinationDirectoryPath = req.body.blobFile;
    var accessKey = '[accountKey]';
    var storageAccount = '[accountName]';
    var containerName = 'nodejs';

    var blobService = azure.createBlobService(storageAccount, accessKey); //ok
    
    if (!fs.existsSync(destinationDirectoryPath)) {
        console.log(destinationDirectoryPath + ' is an invalid directory path.');
    } else {
        downloadFilesParallel(res, blobService, containerName, destinationDirectoryPath);
    }

});



function downloadFilesParallel(res, blobService, containerName, destinationDirectoryPath) {
    blobService.listBlobs(containerName, function (error, blobs) {
        if (error) {
            console.log(error);
        } else {
            var blobsDownloaded = 0;
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            blobs.forEach(function (blob) {
                blobService.getBlobToFile(containerName, blob.name, destinationDirectoryPath + '/' + blob.name, function (error2) {
                    blobsDownloaded++;
                    
                    if (error2) {
                        console.log(error2);
                    } else {
                        res.write('\nBlob ' + blob.name + ' download finished.');
                        
                        if (blobsDownloaded === blobs.length) {
                            // Wait until all workers complete and the blobs are downloaded
                            res.end('\nAll files downloaded');
                        }
                    }
                });
            });
        }
    });
}

//end of download azure blob storage cotent


//upload a file to azure blob storage
app.get('/upload', function (req, res) {
    res.send(
    '<form action="/upload" method="post" enctype="multipart/form-data">' +
    '<input type="file" name="snapshot" />' +
    '<input type="submit" value="Upload" />' +
    '</form>'
);
});

app.post('/upload', function (req, res) {
    var multiparty = require('multiparty');
    var accessKey = '[accountKey]';
    var storageAccount = '[accountName]';

    var container = 'nodejs';    
    var blobService = azure.createBlobService(storageAccount, accessKey);
    var form = new multiparty.Form();
    
    form.on('part', function (part) {
        if (part.filename) {
            
            var size = part.byteCount - part.byteOffset;
            var name = part.filename;
            
            blobService.createBlockBlobFromStream(container, name, part, size, function (error) {
                if (error) {
                    res.send(' Blob create: error ');
                }
            });
        } else {
            form.handlePart(part);
        }
    });
    form.parse(req);
    res.send('OK');
});
//end of upload a file to azure blob storage

//create a server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
