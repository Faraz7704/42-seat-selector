const properties = require('../package.json');
const intraConfig = require('../config/intra.conf')
const SeatSelector = require('../service/seat-selector');
const email = require('../jobs/email-job');

let seatSelector = new SeatSelector();

controllers = {
    getAbout(req, res) {
        let aboutInfo = {
            name:properties.name,
            version: properties.version
        }
        res.json(aboutInfo);
    },
    getTest(req, res) {
        intraConfig.get(`/campus/43/locations`, {
            'page[size]': 100
        }).then((info) => {
            info.json().then(data => {
                res.send(data);
            });
        });
    },
    getClustersSeats(req, res) {
        seatSelector.getClustersSeats().then(info => {
            res.send(info);
        });
    },
    getSeats(req, res) {
        seatSelector.getSeats(req.params.id).then(info => {
            res.send(info);
        });
    },
    upsertSeats(req, res) {
        seatSelector.upsertSeats(req.params.id, req.body).then(status => {
            if (!status) {
                res.status(403).send({
                    status: "403",
                    message: "Cannnot upsert data, please make sure that its in a valid format and is not already inserted."
                });
            } else {
                res.status(200).send({
                    status: "200",
                    message: "Successfull!"
                });
            }
        });
    },
    removeSeats(req, res) {
        const id = req.params.id;
        seatSelector.removeSeats(id, req.body).then((status) => {
            if (!status) {
                res.status(403).send({
                    status: "403",
                    message: "Error occuried during deletion."
                });
            } else {
                res.status(200).send({
                    status: "200",
                    message: "Successfull!"
                });
            }
        });
    },
    getUserSeat(req, res) {
        const id = req.params.id;
        const userId = req.params.user_id;
        seatSelector.getUserSeat(id, userId).then(status => {
            res.send(200).end("OK");
        });
    },
    removeUserFromSeat(req, res) {
        const id = req.params.id;
        const userId = req.params.user_id;
        seatSelector.removeUserFromSeat(id, userId).then((status) => {
            if (!status) {
                res.status(403).send({
                    status: "403",
                    message: "Error occuried during deletion."
                });
            } else {
                res.status(200).send({
                    status: "200",
                    message: "Successfull!"
                });
            }
        });
    },
    updateUserSeat(req, res) {
        const id = req.params.id;
        const userId = req.params.user_id;
        intraConfig.get(`/users/${userId}/locations`, {
            'page[size]': 1
        }).then((info) => {
            info.json().then(user => {
                if (user[0] === undefined) {
                    res.status(403).send({
                        status: "403",
                        message: `Can't find user with id ${userId} in intra.`
                    });
                } else {
                    seatSelector.updateUserSeat(id, req.body, user[0]).then(info => {
                        res.send(info);
                    });
                }
            });
        });
    },
    sentEmails(req, res) {
        const id = req.params.id;
        email.send(id, req.body).then((status) => {
            if (!status) {
                res.status(403).send({
                    status: "403",
                    message: "Mail can't be sent."
                });
            } else {
                res.status(200).send({
                    status: "200",
                    message: "Mail Sent!"
                });
            }
        });
    }
}

module.exports = controllers;