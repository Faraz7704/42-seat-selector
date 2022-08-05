const dbConfig = require('../config/db.conf');
const utils = require('./utils');

module.exports = class SeatSelector {

    constructor() {
        this.dbName = process.env.DB_NAME;
    }

    async getClustersSeats() {
        let cursor = await dbConfig.client.db(this.dbName)
        .listCollections();
        let results = await cursor.toArray();
        return results;
    }

    async removeCluster(id) {
        let result = await dbConfig.client.db(this.dbName)
        .collection(id).drop();
        return result;
    }

    async getSeats(id, filter = {}) {
        let cursor = await dbConfig.client.db(this.dbName)
        .collection(id).find(filter);
        let results = await cursor.toArray();
        return results;
    }

    async upsertSeats(id, seats) {
        if (seats === undefined)
            return true;
        let bulkUpdateSeats = [];
        for (let i = 0; i < seats.length; i++) {
            let seat = seats[i];
            if (seat.id === undefined)
                return false;
            bulkUpdateSeats.push({
                updateOne: {
                    filter: { _id: seat.id },
                    update: {
                        $set: {
                            isEnabled: seat.isEnabled === undefined ? true : seat.isEnabled,
                            isBlocked: seat.isBlocked === undefined ? false : seat.isBlocked,
                            isBooked: seat.isBooked === undefined ? false : seat.isBooked,
                            user: seat.user,
                            lastUpdated: new Date()
                        },
                        $setOnInsert: {
                            _id: seat.id,
                            created: new Date(),
                            emailSent: false,
                            campusId: id
                        }
                    },
                    upsert: true,
                }
            });
        };
        if (bulkUpdateSeats.length == 0)
            return true;
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

    async removeSeats(id, seats) {
        let seatIds = [];
        seats.map(seat => {
            if (seat.id === undefined)
                return false;
            seatIds.push(seat.id);
        });
        let result = await dbConfig.client.db(this.dbName)
        .collection(id)
        .deleteMany(
            { _id: { $in: seatIds } }
        ).catch((e) => {
            console.error(e);
            return false;
        });
        console.log(`${result.deletedCount} documents deleted`);
        return true;
    }

    async getUserSeat(id, userId) {
        let result = await dbConfig.client.db(this.dbName)
        .collection(id)
        .findOne({"user.id": userId });
        return result;
    }

    async getUserSeats(id, userId) {
        let cursor = await dbConfig.client.db(this.dbName)
        .collection(id)
        .find({"user.id": userId });
        let results = await cursor.toArray();
        return results;
    }

    async findFreeSeat(id, maskOut = []) {
        let results = await this.getSeats(id, {
            _id: { $nin: maskOut },
            isEnabled: true,
            isBlocked: false,
            isBooked: false
        });
        let seatSize = results.length;
        if (seatSize > 0) {
            let randIndex = Math.floor(Math.random() * seatSize);
            let freeSeat = results[randIndex];
            return freeSeat;
        }
        return null;
    }

    async removeUserFromSeat(id, userId) {
        console.log(id, ' ', userId);
        let result = await dbConfig.client.db(this.dbName)
        .collection(id)
        .updateMany(
            { "user.id": parseInt(userId) },
            { $set: { isBooked: false, emailSent: false, lastUpdated: new Date() }, $unset: { user: "" } })
        .catch((e) => {
            console.error(e);
            return false;
        });
        console.log(`${result.matchedCount} documents matched the query criteria`);
        console.log(`${result.modifiedCount} documents updated`);
        return true;
    }

    async updateUserSeat(id, body, location) {
        let maskOut = [location.host];
        if (body.reallocate) {
            let mask = await this.getUserSeats(id, location.user.id);
            mask.forEach(x => { maskOut.push(x._id); });
            this.removeUserFromSeat(id, location.user.id);
        }
        let freeSeat = await this.findFreeSeat(id, maskOut);
        if (freeSeat) {
            let user = location.user;
            user.last_location = location.host;
            let result = await dbConfig.client.db(this.dbName)
            .collection(id)
            .updateOne(
                { _id: freeSeat._id },
                { $set: { isBooked: true, emailSent: false , user, lastUpdated: new Date() } });
            console.log(`${result.matchedCount} documents matched the query criteria`);
            console.log(`${result.modifiedCount} documents updated`);
            return await dbConfig.client.db(this.dbName).collection(id).findOne({"_id": freeSeat._id});
        }
        return null;
    }

    getSmartSelectedSeats(countSize, capacity, seats) {
        let seperator = Math.floor(capacity / countSize);
        let selectedSeats = [];
        for (let i = 0; i < capacity; i++) {
            if (i % seperator === 0)
                selectedSeats.push(seats[i]);
        }
        return selectedSeats;
    }

    async getRandSeatsAllocations(strategy, locations, seats) {
        let locSize = locations.length;
        let seatSize = seats.length;
        let selectedSeats = [];
        // Can add more customize strategy to select seats
        if (strategy === 'SMART_RANDOM' || strategy === undefined) {
            selectedSeats = this.getSmartSelectedSeats(locSize, seatSize, seats);
        } else
            return null;
        let freeSeats = [];
        for (let i = 0; i < locSize; i++) {
            let maskSeats = [];
            selectedSeats.forEach((seat) => {
                if (locations[i].host != seat.id)
                    maskSeats.push(seat);
            });
            let randIndex = Math.floor(Math.random() * maskSeats.length);
            let freeSeat = maskSeats[randIndex];
            selectedSeats = utils.removeItemOnce(selectedSeats, freeSeat);
            freeSeat.emailSent = false;
            freeSeat.isBooked = true;
            freeSeat.campusId = locations[i].campus_id;
            freeSeat.user = locations[i].user;
            freeSeat.user.last_location = locations[i].host;
            freeSeats.push(freeSeat);
        }
        return freeSeats;
    }
}