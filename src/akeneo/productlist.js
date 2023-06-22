const https = require('https');

const options = {
    hostname: 'test.bigbrandsllc.co',
    path: '/api/some-endpoint',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <access_token>'
    }
};

const req = https.request(options, (res) => {
    let response_data = '';

    res.on('data', (chunk) => {
        response_data += chunk;
    });
    res.on('end', () => {
        console.log(JSON.parse(response_data));
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();