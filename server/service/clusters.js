var json = require('../assets/clusters.json');

module.exports = clusters = {
    getFlatFormat: (keys) => {
        let map = [];
        let i = 1;
        json.map(element => {
            keys.forEach((key) => {
                if (`lab${i}` === key) {
                    map = map.concat(element[`lab${i}`]);
                    return;
                }
            })
            i++;
        });
        return map;
    },
    getSeatsByLabs: (labs) => {
        let seats = [];
        // TODO: change to intra api call for actual clusters data
        let clusters = require('../assets/clusters.json');
        for (let i = 0; i < labs.length; i++) {
            let labSeatIds = clusters[i][labs[i]];
            if (labSeatIds === undefined)
                return undefined;
            labSeatIds.forEach(seatId => {
                seats.push({ id: seatId });
            });
        }
        return seats;
    }
}