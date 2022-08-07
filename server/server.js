require('dotenv').config();
const dbConfig = require('./config/db.conf');
const authController = require('./api/auth-controller');
const express = require('express');
const routes = require('./api/routes');
const bodyParser = require('body-parser');
const app = express();

dbConfig.init().then(async _ => {
    console.log("Database connected successfully");
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(authController.authTokenValidator);

    routes(app);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
}).catch((err) => {
    console.error(err);
});