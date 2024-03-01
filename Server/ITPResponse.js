
// You may need to add some statements here

module.exports = {

    init: function (version, responseType, sequenceNumber, timestamp, imageData) { // feel free to add function parameters as needed
        //
        // enter your code here

        //Allocate 12 bytes for header
        let packet = Buffer.alloc(12);        
        //Set version field to 9
        storeBitPacket(packet, version, 0, 4);        
        //Set request type to 0
        storeBitPacket(packet, responseType, 4, 2);        
        //Set timestamp
        storeBitPacket(packet, sequenceNumber, 6, 26);
        //Set imagetype
        storeBitPacket(packet, timestamp, 32, 32);        
        //Set fileName length
        const imageSize = imageData ? imageData.length : 0;
        storeBitPacket(packet, imageSize, 56, 32);      
        // Append image data to the packet if available
        if (imageData) {
            packet = Buffer.concat([packet, imageData]);         
        }
        return packet;
    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function (packet) {
        // enter your code here
        return packet;
    }
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
    // let us get the actual byte position of the offset
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (var i = 0; i < number.length; i++) {
        let bytePosition = Math.floor(lastBitPosition / 8);
        let bitPosition = 7 - (lastBitPosition % 8);
        if (number.charAt(j--) == "0") {
            packet[bytePosition] &= ~(1 << bitPosition);
        } else {
            packet[bytePosition] |= 1 << bitPosition;
        }
        lastBitPosition--;
    }
}