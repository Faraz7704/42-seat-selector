let fetch = require('node-fetch');

module.exports = class IntraClient {

    static auth_payload = {
        client_id: process.env.INTRA_KEY,
        client_secret: process.env.INTRA_SECRET,
        grant_type: 'client_credentials',
        scope: process.env.INTRA_SCOPE,
    };

    static token = {};

    static async authTokenValidator(req, res, next) {
        let response = await IntraClient.get(process.env.INTRA_ENDPOINT + '/users');
        if (response.status === 429) {
            let errorMsg = "Intranet is down, please try again later.";
            response = await IntraClient.auth().catch(e => {
                console.error(e);
                res.status(403).end(errorMsg);
                return null;
            });
            if (response['error']) {
                console.log(errorMsg);
                res.status(403).end(errorMsg);
                return null;
            }
            console.log("regenerated token");
        }
        return next();
    }

    static generateHeader(data) {
        return (data === undefined)
        ? { 'Authorization': `Bearer ${IntraClient.token.access_token}` }
        : data;
    }

    static async auth (auth_payload) {
        let url = process.env.INTRA_TOKEN_URL || "https://api.intra.42.fr/v2/oauth/token";
        let response = await IntraClient.post(url,
            auth_payload ? auth_payload : IntraClient.auth_payload, {
                'Authorization': `Bearer Token`,
            });
        IntraClient.token = await response.json();
        return IntraClient.token;
    }

    static async request (url, options) {
        if (!url.includes('https://')) {
            url = process.env.INTRA_ENDPOINT + url;
        }
        return await fetch(url, options).catch(error => {
            console.error(error);
        });
    }

    static async get(url, data, headers) {
        let res = await IntraClient.request(url + '?' + new URLSearchParams(data), {
            method: 'GET',
            headers: IntraClient.generateHeader(headers),
        });
        return res;
    }

    static async post(url, data = {}, headers) {
        let res = await IntraClient.request(url, {
            method: 'POST',
            headers: IntraClient.generateHeader(headers),
            body: new URLSearchParams(data)
        });
        return res;
    }

    // TODO: convert to multi-thread operation
    static async getAll(url, data = {}, headers) {
        data['page[number]'] = 1;
        data['page[size]'] = 100;
        let response = await IntraClient.get(url, data, headers);
        let newHeader = response.headers;
        let total_pages = Math.ceil(newHeader.get('x-total') / newHeader.get('x-per-page'));
        let newResponse = await response.json();
        for (let i = 1; i < total_pages; i++) {
            data['page[number]'] = i + 1;
            response = await IntraClient.get(url, data, headers);
            let temp = await response.json();
            newResponse = newResponse.concat(temp);
        }
        return newResponse;
    }
}