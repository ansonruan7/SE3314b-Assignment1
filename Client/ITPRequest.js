// You may need to add some statements here

module.exports = {
  init: function (version, timestamp, imageType, fileName) {
    // feel free to add function parameters as needed
    //
    // enter your code here

    //Allocate 12 bytes for header
    let packet = Buffer.alloc(12);
    //Set version field to 9
    storeBitPacket(packet, 9, 0, 4);
    //Set request type to 0
    storeBitPacket(packet, 0, 4, 2);
    //Set timestamp
    storeBitPacket(packet, timestamp, 6, 32);
    //Set imagetype
    storeBitPacket(packet, imageType, 38, 4);
    //Set fileName length
    const fileNameSize = fileName.length;
    storeBitPacket(packet, fileNameSize, 42, 28);
    // Append file name to the packet
    const fileNameBytes = stringToBytes(fileName);
    packet = Buffer.concat([packet, Buffer.from(fileNameBytes)]);

    return packet;
    //
  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function (packet) {
    // enter your code here
    return packet;
  },
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

// // Store integer value into specific bit poistion the packet
// function storeBitPacket(packet, value, offset, length) {
//     // let us get the actual byte position of the offset
//     let lastBitPosition = offset + length - 1;
//     let number = value.toString(2);
//     let j = number.length - 1;
//     for (var i = 0; i < number.length; i++) {
//         let bytePosition = Math.floor(lastBitPosition / 8);
//         let bitPosition = 7 - (lastBitPosition % 8);
//         if (number.charAt(j--) == "0") {
//             packet[bytePosition] &= ~(1 << bitPosition);
//         } else {
//             packet[bytePosition] |= 1 << bitPosition;
//         }
//         lastBitPosition--;
//     }
// }

function storeBitPacket(packet, value, offset, length) {
  // Convert value to a binary string and pad it with leading zeros
  let number = value.toString(2).padStart(length, '0');
  let j = number.length - 1;
  let lastBitPosition = offset + length - 1;

  for (let i = 0; i < length; i++) {
      let bytePosition = Math.floor(lastBitPosition / 8);
      let bitPosition = 7 - (lastBitPosition % 8);

      // Set or clear the bit in the packet byte array
      if (number.charAt(j--) === "0") {
          packet[bytePosition] &= ~(1 << bitPosition);
      } else {
          packet[bytePosition] |= 1 << bitPosition;
      }
      lastBitPosition--;
  }
}
