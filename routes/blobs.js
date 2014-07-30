
/*
 * GET home page.
 */


var azure = require('azure');



exports.blobs = function (request, response) {

    var accessKey = '[accountKey]';
    var storageAccount = '[accountName]';
    var container = 'nodejs';

    var blobService = azure.createBlobService(storageAccount, accessKey);
    //render blobs with blobs.jade view
    blobService.listBlobs(container, function (error, blobs) {
        response.render('blobs', {
            error: error,
            container: container,
            blobs: blobs
        });
    });
}