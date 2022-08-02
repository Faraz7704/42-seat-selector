const properties = require("../package.json");
const IntraClient = require("../service/intra-client");
const SeatSelector = require("../service/seat-selector");

let intraClient = new IntraClient();
intraClient.auth().then((token) => {
    console.log('token', token);
});
let seatSelector = new SeatSelector();

controllers = {
    getAbout(req, res) {
        let aboutInfo = {
            name:properties.name,
            version: properties.version
        }
        res.json(aboutInfo);
    },
    getGroupsSeats(req, res) {
        seatSelector.getGroupsSeats().then(info => {
            res.send(info);
        });
    },
    getSeats(req, res) {
        const id = req.params.id;
        seatSelector.getSeats(id).then(info => {
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
        intraClient.get(`/users/${userId}/locations`, {
            'page[size]': 1
        }).then((info) => {
            info.json().then(user => {
                let mask = [user.host];
                seatSelector.allocate(id, user.id, mask).then(seat => {
                    res.send(seat);
                });
            });
        });
    }
}

module.exports = controllers;