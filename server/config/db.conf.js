const MongoClient = require('mongodb').MongoClient;

module.exports = class DBConfig {
    
    static client = new MongoClient(process.env.DB_URI || "");

    static async init() {
        return await DBConfig.client.connect();
    }
}