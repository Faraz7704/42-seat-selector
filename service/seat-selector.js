const dbConfig = require('../config/db.conf');

module.exports = class SeatSelector {

    constructor() {
        this.dbName = "exams_seats_prod";
    }

    async getClustersSeats() {
        let cursor = await dbConfig.client.db(this.dbName)
        .listCollections();
        let results = await cursor.toArray();
        return results;
    }

    async getSeats(id, filter = {}) {
        let cursor = await dbConfig.client.db(this.dbName)
        .collection(id).find(filter);
        let results = await cursor.toArray();
        return results;
    }

    initSeat(seat) {
        if (!seat.user) {
            seat['user'] = {
                userId: null,
                lastSeatId: null,
                poolMonth: null
            }
        }
        if (!seat.isOccupied)
            seat['isOccupied'] = false;
    }

    async upsertSeats(id, seats) {
        for (let i = 0; i < seats.length; i++) {
            initSeat(seat);
        }
        let result = await dbConfig.client.db(this.dbName)
            .collection(id)
            .updateOne({"_id": freeSeat._id }, {
                $set: { isOccupied: true, user }, $currentDate: { lastUpdated: true }});
        return data;
    }

    async getUserSeat(id, userId) {
        let result = await dbConfig.client.db(this.dbName)
        .collection(id)
        .findOne({"userId": userId });
        return result;
    }

    async findFreeSeat(id, maskOut = []) {
        let results = await this.getSeats(id, {
            "id": {"$nin": maskOut},
            "isBlocked": false,
            "isOccupied": false
        });
        let seatSize = results.length;
        if (seatSize > 0) {
            let randIndex = Math.floor(Math.random() * seatSize);
            let freeSeat = results[randIndex];
            return freeSeat;
        }
        return null;
    }

    async updateUserSeat(id, location) {
        let freeSeat = await this.findFreeSeat(id, [location.host]);
        if (freeSeat) {
            let user = {
                id: location.user.id,
                lastSeatId: location.host,
                poolMonth: location.user.pool_month,
            };
            let result = await dbConfig.client.db(this.dbName)
            .collection(id)
            .updateOne({"_id": freeSeat._id }, {
                $set: { isOccupied: true, user }, $currentDate: { lastUpdated: true }});
            console.log(`${result.matchedCount} documents matched the query criteria`);
            console.log(`${result.modifiedCount} documents updated`);
            return await dbConfig.client.db(this.dbName).collection(id).findOne({"_id": freeSeat._id});
        }
        return null;
    }
}