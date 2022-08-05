var json = require('../assets/clusters.json');
const intraConfig = require('../config/intra.conf')

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
    getUsers: async (userIds) => {
        let locations = [];
        let size = userIds.length;
        for (let i = 0; i < size; i++) {
            let userId = userIds[i];
            if (userId === undefined)
                return undefined;
            let json = {};
            let tries = 0;
            do {
                let data = await intraConfig.get(`/users/${userId}/locations`, {
                    'page[size]': 1
                });
                json = await data.json()
                .catch(e => {
                    console.error(e);
                    tries++;
                });
                if (tries > 5) {
                    return null;
                }
            } while (json === undefined);
            locations.push(json[0]);
        }
        return locations;
    }
}