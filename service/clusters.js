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
    getUserLoc: async (userIds, intraClient) => {
        let promises = [];
        userIds.forEach(userId => {
            promises.push(intraClient.get(`/users/${userId}/locations`, {
                'page[size]': 1,
                'sort': '-begin_at',
            }));
        })
        Promise.all(promises).then(data => {
            console.log(data);
            return data.json();
        });
    }
}