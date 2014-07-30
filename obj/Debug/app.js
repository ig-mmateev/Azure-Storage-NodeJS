
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var storage = require('./routes/storage');

var blobs = require('./routes/blobs');

var http = require('http');
var path = require('path');
var azureTable = require('azure-table-node');

    //azure blob


azureTable.setDefaultClient({
    accountUrl: 'http://nodejsdemo.table.core.windows.net/',
    accountName: 'nodejsdemo',
    accountKey: 'nn+GA5scvBRf+Eb88l3rpXmssZi7CcqkIU351Wfurqpi987x4W0PRWjvKNKZsJGmOFvoRKKcH9mrd3LhsrylLw=='
});

var app = express();

var azure = require('azure');

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

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/storage', storage.storage);

app.get('/blobs', blobs.blobs);

app.get('/users', user.list);
app.get("/createTable", function (req, res) {


    //var azureTable = require('azure-table-node');
    //azureTable.setDefaultClient({
    //    accountUrl: 'http://nodejsdemo.table.core.windows.net/',
    //    accountName: 'nodejsdemo',
    //    accountKey: 'nn+GA5scvBRf+Eb88l3rpXmssZi7CcqkIU351Wfurqpi987x4W0PRWjvKNKZsJGmOFvoRKKcH9mrd3LhsrylLw=='
    //});


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

app.get("/displayTable", function (req, res) {

    //var azureTable = require('azure-table-node');
    //azureTable.setDefaultClient({
    //    accountUrl: 'http://nodejsdemo.table.core.windows.net/',
    //    accountName: 'nodejsdemo',
    //    accountKey: 'nn+GA5scvBRf+Eb88l3rpXmssZi7CcqkIU351Wfurqpi987x4W0PRWjvKNKZsJGmOFvoRKKcH9mrd3LhsrylLw=='
    //});


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

    //res.end("Table displayed." + data);

});

app.get("/listTables", function (req, res) {

    
    //azureTable.setDefaultClient({
    //    accountUrl: 'http://nodejsdemo.table.core.windows.net/',
    //    accountName: 'nodejsdemo',
    //    accountKey: 'nn+GA5scvBRf+Eb88l3rpXmssZi7CcqkIU351Wfurqpi987x4W0PRWjvKNKZsJGmOFvoRKKcH9mrd3LhsrylLw=='
    //});
    //var res1 = res;

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

    //res.end("Tables listed.");

});

app.get("/deleteTable", function (req, res) {
   // var azureTable = require('azure-table-node');
    //azureTable.setDefaultClient({
    //    accountUrl: 'http://nodejsdemo.table.core.windows.net/',
    //    accountName: 'nodejsdemo',
    //    accountKey: 'nn+GA5scvBRf+Eb88l3rpXmssZi7CcqkIU351Wfurqpi987x4W0PRWjvKNKZsJGmOFvoRKKcH9mrd3LhsrylLw=='
    //});


    var client = azureTable.getDefaultClient();

    client.deleteTable('testtable', function (err, data) {

    });

    res.end("Table deleted.");

});

app.get('/downloadBlob', function (req, res) {
    res.send(
    '<form action="/downloadBlob" method="post" enctype="multipart/form-data">' +
    '<input type="file" name="snapshot" id="snapshot" onChange="selectFolder(event)"  webkitdirectory directory />' +
    '<input type="text" name="blobFile" />' +
    '<input type="submit" value="Upload" />' +
    '</form>' +
    '<script type="text/javascript">' +

'function selectFolder(e) {' +

	'var theFiles = e.target.files;' +
	
	'for (var i=0, file; file=theFiles[i]; i++) {' +
		'document.write("<li>" + e.webkitRelativePath;);' +
	'}' +
'}' +

'</script>'
);
});


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
    var accessKey = 'nn+GA5scvBRf+Eb88l3rpXmssZi7CcqkIU351Wfurqpi987x4W0PRWjvKNKZsJGmOFvoRKKcH9mrd3LhsrylLw==';
    var storageAccount = 'nodejsdemo';
    var container = 'nodejs';
    var blobService = azure.createBlobService(storageAccount, accessKey);
    var form = new multiparty.Form();
    
    form.on('part', function (part) {
        if (part.filename) {
            
            var size = part.byteCount - part.byteOffset;
            var name = part.filename;
            
           // blobService.createBlockBlobFromStream('c', name, part, size, function (error) {
            blobService.createBlockBlobFromStream(container, name, part, size, function (error) {
                if (error) {
                    res.send({ Grrr: error });
                }
            });
        } else {
            form.handlePart(part);
        }
    });
    form.parse(req);
    res.send('OK');
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
