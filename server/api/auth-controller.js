const intraConfig = require('../config/intra.conf')

module.exports = authController = {
    authTokenValidator: async (req, res, next) => {
        let code = req.body.code;
        let payload = intraConfig.auth_payload;
        // code is used to authenticate user to make api calls
        if (code !== undefined) {
            payload.code = code;
        } else {
            let response = await intraConfig.get(process.env.INTRA_ENDPOINT + '/users');
            if (response.status === 200)
                return next();
        }
        // if access token is defined that means token has expired, can safely call auth again.
        if (code !== undefined || intraConfig.token.access_token !== undefined) {
            let token = await intraConfig.auth(payload);
            if (token === undefined || token['error']) {
                res.status(500).send({
                    status: 500,
                    message: "Intranet is down, please try again later."
                });
                return null;
            } else if (code !== undefined) {
                res.status(200).send({
                    status: 200,
                    access_token: token.access_token
                });
            }
            console.log('token', token);
            return next();
        }
        res.status(400).send({
            status: 400,
            message: "Access token invalid or expired, please sign in again."
        });
    }
}