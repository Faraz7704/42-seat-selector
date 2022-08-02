let fetch = require('node-fetch');

const key = "5cbe72a1c8aab70b68c163b9c626094122fba7f32cb0431fb6983da375e5e67e";
const secret = "c1f05255dc10ae91e326145ce8b221f3358da2faf5f5b801b68df14c45bbdb37";
const token_url = "https://api.intra.42.fr/v2/oauth/token";
const endpoint = "https://api.intra.42.fr/v2";

module.exports = class IntraClient {

    constructor () {
        this.auth_payload = {
            client_id: key,
            client_secret: secret,
            grant_type: 'client_credentials',
            scope: 'public',
        };
    }

    generateHeader(data) {
        return data === undefined ? {
            'Authorization': `Bearer ${this.token.access_token}`,
        } : data;
    }

    async auth (auth_payload) {
        let response = await this.post(token_url,
            auth_payload ? auth_payload : this.auth_payload, {
                'Authorization': `Bearer Token`,
            });
        this.token = await response.json();
        return this.token;
    }

    async request (url, options) {
        if (!url.includes('https://')) {
            url = endpoint + url;
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

    // convert to multi-thread operation
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