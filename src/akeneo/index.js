const https = require('https');

console.log("lkjlkjljlkj okay");
const data = JSON.stringify({
    grant_type: 'password',
    client_id: '2_2and14ao0hq848s8cg84g8cg84scwswogcsgsowkoswco008g0',
    client_secret: 'k29dteqr7hsogcooss4c4ksss8c0ocg4gkws8scg0sg0s8kww',
    username: 'react_9499',
    password: '47d468066',
    secret: 'k29dteqr7hsogcooss4c4ksss8c0ocg4gkws8scg0sg0s8kww'
});

const options = {
    hostname: 'test.bigbrandsllc.co',
    path: '/api/oauth/v1/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
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

req.write(data);
req.end();