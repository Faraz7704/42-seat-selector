let fetch = require('node-fetch');

module.exports = class IntraClient {

    static authHeader = {};

    static generateHeader(data) {
        // adding auth check in middle of a request to intra api
        if (data === undefined)
            data = IntraClient.authHeader;
        else if (data.authorization === undefined)
            data.authorization = IntraClient.authHeader.authorization;
        return data;
    }

    static async auth (payload) {
        let url = process.env.INTRA_TOKEN_URL || "https://api.intra.42.fr/v2/oauth/token";
        let response = await IntraClient.post(url, payload, {
                authorization: `Bearer Token`,
            });
        if (response.status !== 200) {
            console.log(response);
            return undefined;
        }
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

    // TODO: convert to multi-threaded operation
    static async getAll(url, data = {}, headers) {
        data['page[number]'] = 1;
        data['page[size]'] = 100;
        try {
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
        } catch (e) {
            console.error(e);
        }
        return undefined;
    }
}