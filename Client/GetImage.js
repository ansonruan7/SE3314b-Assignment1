let net = require("net");
let fs = require("fs");
let open = require("open");
let singleton = require('../Server/Singleton');

let ITPpacket = require("./ITPRequest"); // uncomment this line after you run npm install command

// Enter your code for the client functionality here
const args = process.argv.slice(2);

// Parse command line arguments
let serverAddress = '';
let serverPort = 0;
let imageName = '';
let fileExtension;
let imageType;
let version = 9; // Default version

for (let i = 0; i < args.length; i++) {
    if (args[i] === '-s' && args[i + 1]) {
        const [ip, port] = args[i + 1].split(':');
        serverAddress = ip;
        serverPort = parseInt(port);
        i++;
    } else if (args[i] === '-q' && args[i + 1]) {
        // Extract image type from the file name's extension
        const meow = args[i+1].split('.');
        fileExtension = meow[1].toLowerCase();
        imageName = meow[0];
        i++;
    } else if (args[i] === '-v' && args[i + 1]) {
        version = parseInt(args[i + 1]);
        i++;
    }
}

switch (fileExtension) {
    case 'png':
        imageType = 1;
        break;
    case 'bmp':
        imageType = 2;
        break;
    case 'tiff':
        imageType = 3;
        break;
    case 'jpeg':
        imageType = 4;
        break;
    case 'gif':
        imageType = 5;
        break;
    case 'raw':
        imageType = 15;
        break;
    default:
        console.error('Unsupported image type:', fileExtension);
        process.exit(1);
}
let details = ([version,imageType,imageName]);


let connectToServer = function (serverAddress, serverPort, imageName) {
  // Create a new TCP socket and connect to the server
  const client = new net.Socket();
  client.connect(serverPort, serverAddress, function () {
    console.log('Connected to ImageDB server on: ' + serverAddress + ':' + serverPort + '\n');

    // Form the ITP request packet
    let time = singleton.getTimestamp();
    const packet = ITPpacket.init(details[0], time, details[1], details[2]); // Assuming image type 1 for PNG

    // Send the request packet to the server
    client.write(packet);
  });

  // Handle data received from the server
  client.on('data', function (data) {
    // Printing received packet in bits format
    console.log("ITP packet header received:");
    printPacketBit(data.slice(0,12));

    //Response Type
    let responseType;
    let thing = parseBitPacket(data, 4, 2);
    switch(thing){
      case(1):
        responseType = 'Found';
        break;
      case(2):
        responseType = 'Not Found';
        break;
      case(3):
        responseType = 'Busy';
        break;
      default:
        responseType = 'Unknown, Error'
    }
    
    console.log('\nServer sent:')
    //Get version
    console.log('ITP version: ' + parseBitPacket(data, 0, 4));        
    //get response type
    console.log('Response Type: ' + responseType);        
    //get sequence number
    console.log('Sequence Number: ' + parseBitPacket(data, 6, 26));
    //Set timestamp
    console.log('Timestamp: ' + parseBitPacket(data, 32, 32));        

    // Extract image contents from the response packet
    const imageData = data.slice(12);

    // Save the image data to a file in the client's current folder
    const fileName = imageName + '.' + fileExtension;
    fs.writeFileSync(fileName, imageData);

    // Open the image file using the default image viewer
    open(fileName);

    cleanup(client);
  });
  const cleanup = (client) => {
    client.destroy();
  }

  // Handle client disconnection
  client.on('close', function() {
    console.log('\nDisconnected from the server\nConnection closed');
    cleanup(client);
});

  // Handle connection errors
  client.on('error', function (err) {
    console.error('Error connecting to server:', err);
    cleanup(client);
  });
}


// Check if all required options are provided
if (!serverAddress || !serverPort || !imageName) {
    console.error('Error: Missing required options. Usage: node GetImage -s <serverIP>:<port> -q <image name> -v <version>');
    process.exit(1);
}

// Call the connectToServer function with the provided options
connectToServer(serverAddress, serverPort, imageName, version);



//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

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


  
