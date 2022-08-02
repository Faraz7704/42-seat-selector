require('dotenv').config();
const express = require('express');
const routes = require('./api/routes');
const db = require('./config/db.conf');

const app = express();
const port = process.env.PORT || 3000;

db.init();
routes(app);

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});