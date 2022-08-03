const properties = require('../package.json');
const intraConfig = require('../config/intra.conf')
const SeatSelector = require('../service/seat-selector');

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
        seatSelector.upsertSeats(req.params.id, req.body).then(info => {
            res.send(info);
        });
    },
    getUserSeat(req, res) {
        const id = req.params.id;
        const userId = req.params.user_id;
        seatSelector.getUserSeat(id, userId).then(info => {
            res.send(info);
        });
    },
    updateUserSeat(req, res) {
        const id = req.params.id;
        const userId = req.params.user_id;
        intraConfig.get(`/users/${userId}/locations`, {
            'page[size]': 1
        }).then((info) => {
            info.json().then(user => {
                seatSelector.updateUserSeat(id, user[0]).then(info => {
                    res.send(info);
                });
            });
        });
    }
}

module.exports = controllers;