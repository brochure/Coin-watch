import http from 'http';
import qs from 'querystring';

export async function get({ url, path, data, responseFormat = 'json' }) {
    return new Promise((resolve, reject) => {
        let req = http.request({
            hostname: url,
            path: `${path}?${qs.stringify(data)}`,
            method: 'GET',
        }, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {
                resolve( responseFormat === 'json' ? JSON.parse(data) : data);
            });
        });

        req.on('error', function (e) {
            reject(e);
        });
        req.end();
    });
}

export async function wait (time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    })
}




