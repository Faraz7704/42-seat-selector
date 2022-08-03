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

    async upsertSeats(id, seats) {
        let bulkUpdateSeats = [];
        for (let i = 0; i < seats.length; i++) {
            let seat = seats[i];
            if (!seat.id)
                return false;
            bulkUpdateSeats.push({
                updateOne: {
                    filter: { _id: seat.id },
                    update: {
                        $set: {
                            isEnabled: seat.isEnabled === undefined ? true : seat.isEnabled,
                            isBlocked: seat.isBlocked === undefined ? false : seat.isBlocked,
                            isBooked: seat.isBooked === undefined ? false : seat.isBooked,
                            lastUpdated: new Date()
                        },
                        $setOnInsert: {
                            _id: seat.id,
                            created: new Date()
                        }
                    },
                    upsert: true,
                }
            });
        };
        try {
            let result = await dbConfig.client.db(this.dbName)
                .collection(id)
                .bulkWrite(bulkUpdateSeats);
                console.log(`${result.modifiedCount} documents updated`);
                console.log(result.upsertedIds);
        } catch (e) {
            console.error(e);
            return false;
        }
        return true;
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
            "isEnabled": true,
            "isBlocked": false,
            "isBooked": false
        });
        let seatSize = results.length;
        if (seatSize > 0) {
            let randIndex = Math.floor(Math.random() * seatSize);
            let freeSeat = results[randIndex];
            return freeSeat;
        }
        return null;
    }

    async removeUserfromSeat(id, userId) {
        let seat = await dbConfig.client.db(this.dbName).collection(id).findOne({"user.id": userId});
        if (seat) {
            let result = await dbConfig.client.db(this.dbName)
            .collection(id)
            .updateOne({"_id": seat._id }, {
                $set: { isBooked: false, lastUpdated: new Date() }, $unset: { user: "" } });
            console.log(`${result.matchedCount} documents matched the query criteria`);
            console.log(`${result.modifiedCount} documents updated`);
            return true;
        }
        return false;
    }

    async updateUserSeat(id, body, location) {
        if (body.reallocate)
            this.removeUserfromSeat(id, location.user.id);
        let freeSeat = await this.findFreeSeat(id, [location.host]);
        if (freeSeat) {
            let result = await dbConfig.client.db(this.dbName)
            .collection(id)
            .updateOne({"_id": freeSeat._id }, {
                $set: { isBooked: true, user: location.user, lastUpdated: new Date() } });
            console.log(`${result.matchedCount} documents matched the query criteria`);
            console.log(`${result.modifiedCount} documents updated`);
            return await dbConfig.client.db(this.dbName).collection(id).findOne({"_id": freeSeat._id});
        }
        return null;
    }
}