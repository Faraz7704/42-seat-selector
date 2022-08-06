const properties = require('../package.json');
const intraConfig = require('../config/intra.conf')
const SeatSelector = require('../service/seat-selector');
const email = require('../jobs/email-job');
const clusters = require('../service/clusters');

let seatSelector = new SeatSelector(process.env.DB_NAME);
let emailTemplate = process.env.EMAIL_TEMPLATE;

async function getUsersLocations (userIds) {
    let locations = [];
    let size = userIds.length;
    for (let i = 0; i < size; i++) {
        let userId = userIds[i];
        if (userId === undefined)
            return undefined;
        let json = {};
        let data = {};
        let tries = 0;
        do {
            try {
                data = await intraConfig.get(`/users/${userId}/locations`, {
                    'page[size]': 1
                });
                json = await data.json();
            } catch(e) {
                console.error(e);
                tries++;
            };
            if (tries > 5) {
                return undefined;
            }
        } while (data === undefined || json === undefined);
        locations.push(json[0]);
    }
    return locations;
}

async function getSeatsAllocations(url, seats, options) {
    let events = await intraConfig.getAll(url);
    if (!events) {
        return {
            status: 500,
            message: `Can't connect to intra right now.`
        };
    }
    let eventSize = events.length;
    let seatSize = seats.length;
    if (eventSize > seatSize || events.length == 0) {
        return {
            status: 400,
            message: `Not enough space to allocate ${eventSize} users on ${seatSize} seats.`
        };
    }
    let userIds = events.map(x => x.user_id);
    let locations = await getUsersLocations(userIds);
    if (locations === undefined) {
        return {
            status: 500,
            message: `Can't connect to intra right now.`
        };
    }
    // Can add more customize strategy to select seats
    if (options.strategy === 'SMART_RANDOM' || options.strategy === undefined) {
        let newSeats = await seatSelector.getSmartRandomSeats(locations, seats, options.minSpacing);
        if (newSeats !== undefined) {
            return {
                status: 200,
                data: newSeats
            };
        }
    }
    return {
        status: 400,
        message: `Can't allocate seats please make sure the body is correct.`
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

function getSeatsByOptions(body) {
    const labs = body.labs;
    let seats = body.seats;
    if (labs !== undefined)
        seats = clusters.getSeatsByLabs(labs);
    return seats;
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
        const seats = getSeatsByOptions(req.body);
        if (seats === undefined) {
            return {
                status: 400,
                message: `Can't allocate seats please make sure the body is correct.`
            };
        }
        // TODO: path should be changed to '/exams/${id}/exams_users'
        const url = `/events/${id}/events_users`;
        getSeatsAllocations(url, seats, req.body)
        .then(result => {
            if (result.status == 200) {
                if (req.body.sendEmail) {
                    email.send(emailTemplate, result.data).then((emailsSent) => {
                        if (!emailsSent || emailsSent.length > result.data.length) {
                            console.log("Error occured not all emails sent.")
                        } else {
                            for (let i = 0; i < result.data.length; i++) {
                                result.data[i].emailSent = emailsSent[i];
                            }
                        }
                        res.status(200).send(result.data);
                    });
                } else {
                    res.status(200).send(result.data);
                }
            } else
                res.status(result.status).send(result.message);
        });
    },
    seatsGenerator(req, res) {
        const id = req.params.id;
        const seats = getSeatsByOptions(req.body);
        if (seats === undefined) {
            return {
                status: 400,
                message: `Error reading seats please make sure the body is correct.`
            };
        }
        // TODO: path should be changed to '/exams/${id}/exams_users'
        const url = `/events/${id}/events_users`;
        getSeatsAllocations(url, seats, req.body)
        .then(allocate => {
            if (allocate.status == 200) {
                seatSelector.removeCluster(id)
                .then( _ => {
                    upsertSeatsInDB(id, allocate.data)
                    .then(result => {
                        if (req.body.sendEmail) {
                            email.send(emailTemplate, allocate.data).then((emailsSent) => {
                                if (!emailsSent || emailsSent.length < allocate.data.length) {
                                    console.log("Error occured not all emails sent.")
                                    return;
                                }
                                let userIds = allocate.data.map(x => x.user.id);
                                seatSelector.updateUsersEmailStatus(id, userIds);
                            });
                        }
                        res.status(result.status).send(result.message);
                    });
                });
            } else
                res.status(allocate.status).send(allocate.message);
        });
    },
    upsertSeats(req, res) {
        const id = req.params.id;
        const seats = getSeatsByOptions(req.body);
        if (seats === undefined) {
            res.status(400).send({
                status: 400,
                message: `Error reading seats please make sure the body is correct.`
            });
        } else {
            upsertSeatsInDB(id, seats).then(result => {
                res.status(result.status).send(result.message);
            });
        }
    },
    insertSeats(req, res) {
        const id = req.params.id;
        const seats = getSeatsByOptions(req.body);
        if (seats === undefined) {
            res.status(400).send({
                status: 400,
                message: `Error reading seats please make sure the body is correct.`
            });
        } else {
            seatSelector.removeCluster(id).then( _ => {
                upsertSeatsInDB(id, seats).then(result => {
                    res.status(result.status).send(result.message);
                });
            });
        }
    },
    removeSeats(req, res) {
        const id = req.params.id;
        const seats = getSeatsByOptions(req.body);
        if (seats === undefined) {
            seatSelector.removeCluster(id).then(_ => {
                res.status(200).send({
                    status: 200,
                    message: "Successfull!"
                });
            });
        } else {
            seatSelector.removeSeats(id, seats).then((status) => {
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
        }
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
        const sendEmailAgain = req.body.sendEmailAgain === undefined ? false : req.body.sendEmailAgain;
        seatSelector.getUsersByEmailStatus(id, sendEmailAgain).then(receivers => {
            email.send(receivers).then((emailsSent) => {
                if (!emailsSent || emailsSent.length < receivers.length) {
                    res.status(500).send({
                        status: 500,
                        message: "Error occured not all emails sent."
                    });
                } else {
                    let userIds = receivers.map(x => x.user.id);
                    seatSelector.updateUsersEmailStatus(id, userIds).then( _ => {
                        res.status(200).send({
                            status: 200,
                            message: "Mail Sent!"
                        });
                    });
                }
            });
        });
    }
}

module.exports = controllers;