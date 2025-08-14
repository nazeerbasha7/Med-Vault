// Test hex encoding functions
import { stringToHex, hexToString } from '../src/utils/blockchain.js';

// Test the hex encoding functions
function testHexEncoding() {
  console.log('Testing hex encoding functions...\n');

  // Test 1: IPFS CID
  const testCid = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
  const cidHex = stringToHex(testCid);
  const decodedCid = hexToString(cidHex);
  
  console.log('IPFS CID Test:');
  console.log('Original CID:', testCid);
  console.log('Hex encoded: ', cidHex);
  console.log('Decoded back:', decodedCid);
  console.log('Match:', testCid === decodedCid ? '✅' : '❌');
  console.log();

  // Test 2: Doctor Handle
  const doctorHandle = 'Dr_12345678';
  const handleHex = stringToHex(doctorHandle);
  const decodedHandle = hexToString(handleHex);
  
  console.log('Doctor Handle Test:');
  console.log('Original handle:', doctorHandle);
  console.log('Hex encoded:   ', handleHex);
  console.log('Decoded back:  ', decodedHandle);
  console.log('Match:', doctorHandle === decodedHandle ? '✅' : '❌');
  console.log();

  // Test 3: File Type
  const fileType = 'consultation';
  const typeHex = stringToHex(fileType);
  const decodedType = hexToString(typeHex);
  
  console.log('File Type Test:');
  console.log('Original type:', fileType);
  console.log('Hex encoded: ', typeHex);
  console.log('Decoded back:', decodedType);
  console.log('Match:', fileType === decodedType ? '✅' : '❌');
  console.log();

  // Test 4: Record ID
  const recordId = 'record_l1b2c3d4e5_f6g7h8i9j0';
  const recordHex = stringToHex(recordId);
  const decodedRecord = hexToString(recordHex);
  
  console.log('Record ID Test:');
  console.log('Original ID: ', recordId);
  console.log('Hex encoded: ', recordHex);
  console.log('Decoded back:', decodedRecord);
  console.log('Match:', recordId === decodedRecord ? '✅' : '❌');
  console.log();

  // Test 5: Encrypted Key
  const encryptedKey = 'aGVsbG8gd29ybGQgdGhpcyBpcyBhIHRlc3Q=';
  const keyHex = stringToHex(encryptedKey);
  const decodedKey = hexToString(keyHex);
  
  console.log('Encrypted Key Test:');
  console.log('Original key:', encryptedKey);
  console.log('Hex encoded: ', keyHex);
  console.log('Decoded back:', decodedKey);
  console.log('Match:', encryptedKey === decodedKey ? '✅' : '❌');
}

testHexEncoding();
