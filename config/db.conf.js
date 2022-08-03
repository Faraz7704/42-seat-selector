const MongoClient = require('mongodb').MongoClient;

module.exports = class DBConfig {
    
    static client = new MongoClient(process.env.DB_URI || "");

    static init() {
        DBConfig.client.connect().catch((e) => {
            console.error(e);
        });
    }
}