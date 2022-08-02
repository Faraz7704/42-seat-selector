let properties = require("../package.json");
let IntraClient = require("./intra-client");
let examUsers = require("../service/exam-users")
let clusters = require("../service/clusters");
let SeatSelector = require("../service/seat-selector");

var intraClient = new IntraClient();
intraClient.auth().then((token) => {
    console.log('token', token);
});

controllers = {
    about(req, res, db) {
        var aboutInfo = {
            name:properties.name,
            version: properties.version
        }
        res.json(aboutInfo);
    },
    locations(req, res, db) {
        intraClient.get('/locations', {
            'page[size]': 100
        }).then((info) => {
            if (!info) {
                res.sendStatus(403);
                return;
            }
            res.send(info);
        });
    },
    locByCampusId(req, res, db) {
        const id = req.params.id;
        intraClient.get(`/users/${id}/locations`, {
            'page[size]': 1,
            'sort': '-begin_at',
        }).then((info) => {
            if (!info) {
                res.sendStatus(403);
                return;
            }
            res.send(info);
        });
    },
    // seatsByExamId(req, res) {
    //     const exam_id = req.params.exam_id;
    //     intraClient.getAll(`/events/${exam_id}/events_users`).then((examUsersInfo) => {
    //         let userIds = examUsers.getIds(examUsersInfo);
    //         let clustersInfo = clusters.getFlatFormat(['lab1']);
    //         console.log(userIds);
    //         console.log(clustersInfo);
    //         intraClient.getAll(`/locations`, {
    //             'filter[user_id]': userIds,
    //             'filter[host]': clustersInfo
    //         }).then((usersLocInfo) => {
    //             res.send(usersLocInfo);
    //         });
    //     });
    // }
    seatsByExamId(req, res, db) {
        const exam_id = req.params.exam_id;
        intraClient.getAll(`/events/${exam_id}/events_users`).then((examUsersInfo) => {
            let userIds = examUsers.getIds(examUsersInfo);
            clusters.getUserLoc(userIds, intraClient).then(usersLocInfo => {
                // console.log(usersLocInfo);
                // res.send(usersLocInfo);
            });
        });
    }
}

module.exports = controllers;