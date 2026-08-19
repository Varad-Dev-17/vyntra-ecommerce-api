const http = require('http');

const data = JSON.stringify({
  email: 'testuser1@example.com',
  codeProvided: '647580'
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/auth/verify-verification-code',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
