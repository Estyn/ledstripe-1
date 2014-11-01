var querystring = require('querystring');
var http = require('http');
var myLedStripe = require('./index');
var numLEDs = 240;
var aBuf = new Buffer(numLEDs * 3);

function nonformatted() {
    var somevar = 'do i get tabbed?'
    console.log('test');

}

function processPost(request, response, callback) {
    var queryData = "";
    if (typeof callback !== 'function') return null;

    if (request.method == 'POST') {
        request.on('data', function (data) {
            queryData += data;
            if (queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function () {
            console.log('querydata');
            console.log(queryData);
            request.post = queryData;
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

//var payload = {
// 'method': 'fill',
// 'section': 'all',
// 'color': {'r':'FF', 'g': 'FF', 'b': '00'}
// }
function stringToHex(str) {
    var hex, i;
    // var str = "\u6f22\u5b57"; // "\u6f22\u5b57" === "漢字"
    var result = "";
    for (i = 0; i < str.length; i++) {
        hex = str.charCodeAt(i).toString(16);
        result += ("000" + hex).slice(-4);
    }
    return result;
}


http.createServer(function (request, response) {
    if (request.method == 'POST') {
        processPost(request, response, function () {
            console.log(request.post);
            // Use request.post here

            //requestData = JSON.parse(request.post);
            requestData = request.post;
            requestData = JSON.parse(request.post);
            requestData.color.r = stringToHex(requestData.color.r);
            requestData.color.g = stringToHex(requestData.color.g);
            requestData.color.b = stringToHex(requestData.color.b);
            console.log(requestData.color.r);

            // everything possibly sane
            myStripeType = 'LPD8806';
            mySpiDevice = '/dev/spidev0.1';
            console.log('Testing ' + myStripeType + ' LED stripe with ' + numLEDs + ' LEDs on SPI ' + mySpiDevice);

            // connecting to SPI
            myLedStripe.connect(numLEDs, myStripeType, mySpiDevice);
            console.log('method'+requestData.method);
            if (requestData.method == 'fill') {
                if (requestData.section == 'all')
                {
                    console.log('all')
                    fillBuffer(aBuf, 1, 0x00, 0x00, 0xFF);
                    fillBuffer(aBuf, 2, 0x00, 0xFF, 0x00);
                    fillBuffer(aBuf, 3, 0xFF, 0x00, 0x00);
                    myLedStripe.sendRgbBuf(aBuf);
                }
                else {
                    console.log('section: '+requestData.section)

                        fillBuffer(aBuf, requestData.section, requestData.color.r, requestData.color.g, requestData.color.b);
                        myLedStripe.sendRgbBuf(aBuf);



                }


            }
            if (requestData.method == 'blink') {
                if (requestData.section == 'all')
                {
                    console.log('all')
                    fillBuffer(aBuf, 1, 0x00, 0x00, 0xFF);
                    fillBuffer(aBuf, 2, 0x00, 0xFF, 0x00);
                    fillBuffer(aBuf, 3, 0xFF, 0x00, 0x00);
                    myLedStripe.sendRgbBuf(aBuf);
                }
                else {
                    console.log('section: '+requestData.section)
                    setTimeout(function () {
                        fillBuffer(aBuf, requestData.section, requestData.color.r, requestData.color.g, requestData.color.b);
                        myLedStripe.sendRgbBuf(aBuf);
                    },1000);
                    setTimeout(function () {
                        fillBuffer(aBuf, requestData.section, 0x00,0x00,0x00);
                        myLedStripe.sendRgbBuf(aBuf);
                    },1000);
                    setTimeout(function () {
                        fillBuffer(aBuf, requestData.section, requestData.color.r, requestData.color.g, requestData.color.b);
                        myLedStripe.sendRgbBuf(aBuf);
                    },1000);
                    setTimeout(function () {
                        fillBuffer(aBuf, requestData.section, 0x00,0x00,0x00);
                        myLedStripe.sendRgbBuf(aBuf);
                    },1000);
                }


            }

            if (requestData.method == 'off') {

                    console.log('off')
                    fillBuffer(aBuf, 1, 0x00, 0x00, 0x00);
                    fillBuffer(aBuf, 2, 0x00, 0x00, 0x00);
                    fillBuffer(aBuf, 3, 0x00, 0x00, 0x00);
                    myLedStripe.sendRgbBuf(aBuf);
            }
            setTimeout(function () {
                //chaseBuffer(aBuf, 3, 0xFF, 0x00, 0x00);
            }, 1000);

            response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
            response.end();

        });
    }
    else {
        response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
        response.end();
    }


    function chaseBuffer(aBuf, section, r, g, b) {
        for (var i = numLEDs * (section - 1); i < numLEDs * section; i += 3) {

            aBuf[i + 0] = 0xFF;
            aBuf[i + 1] = 0xFF;
            aBuf[i + 2] = 0xFF;
        }
        console.log('set white');
        for (var i = numLEDs * (section - 1); i < numLEDs * section; i += 3) {

            aBuf[i + 0] = 0xFF;
            aBuf[i + 1] = 0xFF;
            aBuf[i + 2] = 0xFF;
            aBuf[i + 3] = r;
            aBuf[i + 4] = b;
            aBuf[i + 5] = g;
            console.log('set pixel' + i);
            setTimeout(function () {
                myLedStripe.sendRgbBuf(aBuf);
            }, 1000);

        }

    }
}).
    listen(8000);
function fillBuffer(aBuf, section, r, g, b) {
    for (var i = numLEDs * (section - 1); i < numLEDs * section; i += 3) {

        aBuf[i + 0] = r;
        aBuf[i + 1] = b;
        aBuf[i + 2] = g;
    }
}