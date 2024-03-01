let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');
let fs = require('fs');
let path = require('path');

// Folder path containing images
const imageFolder = './images';

module.exports = {
    handleClientJoining: function (sock) {
        singleton.init();
        let clientNumber = singleton.getTimestamp();
        // Log client connection
        console.log(`Client-${clientNumber} is connected at timestamp: ${clientNumber}\n`);

        // Print client request
        sock.on('data', function (data) {
            let thing;
            const version = parseBitPacket(data, 0, 4);
            if(version != 9){
                sock.end();
                return;
            }
            const requestType = parseBitPacket(data, 4, 2);
            if(requestType == 0){
                thing = 'Query';
            } else {
                sock.end();
                return;
            }
            console.log('Client Request Packet Received:');
            printPacketBit(data);

            // Extract image name from request packet
            const imageName = bytesToString(data.slice(12)); // Assuming image name starts from byte 13
            // Extract packet fields
            const timestamp = parseBitPacket(data, 6, 32);
            const imageType = parseBitPacket(data, 38, 4);

            //Get file extension
            let imageExt;
            switch (imageType) {
                case 1:
                    imageExt = 'PNG';
                    break;
                case 2:
                    imageExt = 'BMP';
                    break;
                case 3:
                    imageExt = 'TIFF';
                    break;
                case 4:
                    imageExt = 'JPEG';
                    break;
                case 5:
                    imageExt = 'GIF';
                    break;
                case 15:
                    imageExt = 'RAW';
                    break;
                default:
                    console.error('Unsupported image type:', imageType);
                    process.exit(1);
            }

            // Print extracted fields
            console.log(`\nClient-${clientNumber} requests:`)
            console.log('ITP version:', version);
            console.log('Request type:', thing);
            console.log('Timestamp:', timestamp);
            console.log('Image File Extension:', imageExt);
            console.log('Image Name:', imageName);

            // Find the image in the folder
            const imagePath = path.join(imageFolder, imageName + '.' + imageExt.toLowerCase());

            fs.access(imagePath, fs.constants.F_OK, (err) => {
                if (err) {
                    // Image not found, send 'Not Found' response
                    sendResponse(sock, 2, timestamp);
                } else {
                    // Image found, send 'Found' response
                    fs.readFile(imagePath, (err, imageData) => {
                        if (err) {
                            console.error('Error reading image:', err);
                            return;
                        }

                        // Form the ITP response packet
                        const version = 9; // Example version number
                        const responseType = 1; // Found
                        const sequenceNumber = singleton.getSequenceNumber(); // Get sequence number from singleton
                        const image = imageName; // Image name
                        const responsePacket = ITPpacket.init(version, responseType, sequenceNumber, singleton.getTimestamp(), imageData);

                        // Send the response packet to the client
                        sock.write(responsePacket);
                    });
                }
            });
        });

        // Handle client disconnection
        sock.on('close', function() {
            console.log(`\nClient-${clientNumber} closed the connection`);
        });
    }
};

// Helper function to send response packet
function sendResponse(sock, responseType, timestamp) {
    const version = 9; // Example version number
    const sequenceNumber = singleton.getSequenceNumber(); // Get sequence number from singleton
    const image = ''; // No image
    const responsePacket = ITPpacket.init(version, responseType, sequenceNumber, timestamp, image, null);

    // Send the response packet to the client
    sock.write(responsePacket);
}

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
      // let us get the actual byte position of the offset
      let bytePosition = Math.floor((offset + i) / 8);
      let bitPosition = 7 - ((offset + i) % 8);
      let bit = (packet[bytePosition] >> bitPosition) % 2;
      number = (number << 1) | bit;
    }
    return number;
  }

// Prints the entire packet in bits format
function printPacketBit(packet) {
    var bitString = "";

    for (var i = 0; i < packet.length; i++) {
        // To add leading zeros
        var b = "00000000" + packet[i].toString(2);
        // To print 4 bytes per line
        if (i > 0 && i % 4 == 0) bitString += "\n";
        bitString += " " + b.substr(b.length - 8);
    }
    console.log(bitString);
}

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}