let fetch = require('node-fetch');

module.exports = class IntraClient {

    constructor () {
        this.auth_payload = {
            client_id: process.env.INTRA_KEY,
            client_secret: process.env.INTRA_SECRET,
            grant_type: 'client_credentials',
            scope: process.env.INTRA_SCOPE,
        };
        console.log(this.auth_payload);
    }

    generateHeader(data) {
        return data === undefined ? {
            'Authorization': `Bearer ${this.token.access_token}`,
        } : data;
    }

    async auth (auth_payload) {
        let url = process.env.INTRA_TOKEN_URL || "https://api.intra.42.fr/v2/oauth/token";
        let response = await this.post(url,
            auth_payload ? auth_payload : this.auth_payload, {
                'Authorization': `Bearer Token`,
            });
        this.token = await response.json();
        return this.token;
    }

    async request (url, options) {
        if (!url.includes('https://')) {
            url = process.env.INTRA_ENDPOINT + url;
        }
        return await fetch(url, options).catch(error => {
            console.log('Error: ', error);
        });
    }

    async get(url, data, headers) {
        let res = await this.request(url + '?' + new URLSearchParams(data), {
            method: 'GET',
            headers: this.generateHeader(headers),
        });
        return res;
    }

    async post(url, data = {}, headers) {
        let res = await this.request(url, {
            method: 'POST',
            headers: this.generateHeader(headers),
            body: new URLSearchParams(data)
        });
        return res;
    }

    // TODO: convert to multi-thread operation
    async getAll(url, data = {}, headers) {
        data['page[number]'] = 1;
        data['page[size]'] = 100;
        let response = await this.get(url, data, headers);
        let newHeader = response.headers;
        let total_pages = Math.ceil(newHeader.get('x-total') / newHeader.get('x-per-page'));
        let newResponse = await response.json();
        for (let i = 1; i < total_pages; i++) {
            data['page[number]'] = i + 1;
            response = await this.get(url, data, headers);
            let temp = await response.json();
            newResponse = newResponse.concat(temp);
        }
        return newResponse;
    }
}