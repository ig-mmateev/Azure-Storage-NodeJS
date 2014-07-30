
/*
 * GET home page.
 */


var azure = require('azure');



exports.blobs = function (request, response) {

    var accessKey = 'nn+GA5scvBRf+Eb88l3rpXmssZi7CcqkIU351Wfurqpi987x4W0PRWjvKNKZsJGmOFvoRKKcH9mrd3LhsrylLw==';
    var storageAccount = 'nodejsdemo';
    var container = 'nodejs';

    var blobService = azure.createBlobService(storageAccount, accessKey);
    blobService.listBlobs(container, function (error, blobs) {
        response.render('blobs', {
            error: error,
            container: container,
            blobs: blobs
        });
    });
}