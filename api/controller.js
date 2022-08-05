const properties = require('../package.json');
const intraConfig = require('../config/intra.conf')
const SeatSelector = require('../service/seat-selector');
const email = require('../jobs/email-job');
const clusters = require('../service/clusters');

let seatSelector = new SeatSelector();

async function getSeatsAllocations(url, seats, strategy) {
    let events = await intraConfig.getAll(url);
    if (events === undefined) {
        return {
            status: 500,
            message: `Can't connect to intra right now.`
        };
    }
    let eventSize = events.length;
    let seatSize = seats.length;
    if (eventSize > seatSize) {
        return {
            status: 400,
            message: `Not enough space to allocate ${eventSize} users on ${seatSize} seats.`
        };
    }
    let userIds = events.map(x => x.user_id);
    let locations = await clusters.getUsers(userIds);
    if (locations === undefined) {
        return {
            status: 500,
            message: `Can't connect to intra right now.`
        };
    }
    let newSeats = await seatSelector.getRandSeatsAllocations(strategy, locations, seats);
    if (newSeats === undefined) {
        return {
            status: 400,
            message: `Can't allocate seats please make sure the body is correct.`
        };
    }
    return {
        status: 200,
        data: newSeats
    };
}

async function upsertSeatsInDB(id, seats) {
    let status = await seatSelector.upsertSeats(id, seats)
    if (!status) {
        return {
            status: 400,
            message: "Cannnot upsert data, please make sure that its in a valid format and is not already inserted."
        };
    }
    return {
        status: 200,
        message: "Successfull!"
    };
}

controllers = {
    getAbout(req, res) {
        let aboutInfo = {
            name:properties.name,
            version: properties.version
        }
        res.json(aboutInfo);
    },
    getTest(req, res) {
        //https://meta.intra.42.fr/clusters.json
        intraConfig.get(`/users/93141/locations`, {
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
    oneTimeSeatsGen(req, res) {
        const id = req.params.id;
        const seats = req.body.seats;
        const url = `/events/${id}/events_users`;     // path should be changed to '/exams/${id}/exams_users'
        getSeatsAllocations(url, seats, req.body.strategy)
        .then(result => {
            if (result.status == 200)
                res.status(200).send(result.data);
            else
                res.status(result.status).send(result.message);
        });
    },
    seatsGenerator(req, res) {
        const id = req.params.id;
        const seats = req.body.seats;
        const url = `/events/${id}/events_users`;    // path should be changed to '/exams/${id}/exams_users'
        getSeatsAllocations(url, seats, req.body.strategy)
        .then(result => {
            if (result.status == 200) {
                seatSelector.removeCluster(id)
                .then( _ => {
                    upsertSeatsInDB(id, result.data)
                    .then(result => {
                        res.status(result.status).send(result.message);
                    });
                });
            } else
                res.status(result.status).send(result.message);
        });
    },
    upsertSeats(req, res) {
        const id = req.params.id;
        const seats = req.body.seats;
        upsertSeatsInDB(id, seats).then(result => {
            res.status(result.status).send(result.message);
        });
    },
    removeSeats(req, res) {
        const id = req.params.id;
        seatSelector.removeSeats(id, req.body).then((status) => {
            if (!status) {
                res.status(500).send({
                    status: 500,
                    message: "Error occuried during deletion."
                });
            } else {
                res.status(200).send({
                    status: 200,
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
                res.status(500).send({
                    status: 500,
                    message: "Error occuried during deletion."
                });
            } else {
                res.status(200).send({
                    status: 200,
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
                    res.status(400).send({
                        status: 400,
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
                res.status(500).send({
                    status: 500,
                    message: "Mail can't be sent."
                });
            } else {
                res.status(200).send({
                    status: 200,
                    message: "Mail Sent!"
                });
            }
        });
    }
}

module.exports = controllers;