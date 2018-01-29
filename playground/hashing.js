const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');


let data = { id: 10 };

let secret = '123abc';
let token = jwt.sign(data, secret);
console.log('Token:', token);

let decoded = jwt.verify(token, secret);
console.log('Decoded:', decoded);



/* ------------------------------------------------------------------------------------ */

/*
const message = 'I am user number 3';
const hash = SHA256(message).toString();

console.log('Message:', message);
console.log('Hash:', hash);



let data = {
    id: 4
};

// 'somesecret' is the SALT
let token = {
    data,
    hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
};

// Malicious actions from man-in-the-middle
token.data.id = 5;
token.hash = SHA256(JSON.stringify(token.data)).toString();
// The above 'attack' won't work because of the SALT

const resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

if (resultHash === token.hash) {
    console.log('Data was not changed');
} else {
    console.log('Data was changed. Don\'t trust!');
}
*/