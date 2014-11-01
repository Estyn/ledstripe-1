var querystring = require('querystring');
var http = require('http');
//var myLedStripe = require('./index');

function nonformatted(){
var somevar = 'do i get tabbed?'
console.log('test');

}

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

    http.createServer(function(request, response) {
        if(request.method == 'POST') {
            processPost(request, response, function() {
                console.log(request.post);
                // Use request.post here

                numLEDs = 240;
                      // everything possibly sane
                      myStripeType = 'LPD8806';
                      mySpiDevice = '/dev/spidev0.1';
                      console.log('Testing ' + myStripeType + ' LED stripe with ' + numLEDs + ' LEDs on SPI ' + mySpiDevice);
                      //myLedStripe.fill(0xFF, 0x00, 0x00);
                      // connecting to SPI
                      //myLedStripe.connect(numLEDs, myStripeType, mySpiDevice);

                      response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                      response.end();

            });
        } else {
            response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
            response.end();
        }

    }).listen(8000);