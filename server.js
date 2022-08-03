require('dotenv').config();
const express = require('express');
const routes = require('./api/routes');
const dbConfig = require('./config/db.conf');
const intraConfig = require('./config/intra.conf');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

dbConfig.init();
intraConfig.auth().then((token) => {
    console.log('token', token);
    app.use(bodyParser.json());
    app.use(intraConfig.authTokenValidator);
    routes(app);
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});