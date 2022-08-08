const dbConfig = require('../config/db.conf');
const utils = require('./utils');

module.exports = class SeatSelector {

    constructor(dbName) {
        this.dbName = dbName;
    }

    async getClustersSeats() {
        let cursor = await dbConfig.client.db(this.dbName)
        .listCollections();
        let results = await cursor.toArray();
        return results;
    }

    async removeCluster(id) {
        try {
            await dbConfig.client.db(this.dbName)
            .collection(id).drop();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
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
                            campusId: seat.campusId
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
        if (seatIds.length == 0)
            return false;
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
        return undefined;
    }

    async removeUserFromSeat(id, userId) {
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
        return undefined;
    }

    async getUsersByEmailStatus(id, sendEmailAgain = false) {
        let cursor = await dbConfig.client.db(this.dbName)
        .collection(id)
        .find({ 'user.id': { '$exists': true }, emailSent: sendEmailAgain, isBooked: true });
        let results = await cursor.toArray();
        return results;
    }
    
    async updateUsersEmailStatus(id, userIds) {
        let result = await dbConfig.client.db(this.dbName)
        .collection(id)
        .updateMany(
            { 'user.id': { '$exists': true, '$in': userIds } },
            { $set: { emailSent: true, lastUpdated: new Date() } });
        console.log(`${result.matchedCount} documents matched the query criteria`);
        console.log(`${result.modifiedCount} documents updated`);
        return result;
    }

    getSelectedSeats(size, seats, minSpacing) {
        let capacity = seats.length;
        let spacing = Math.floor(capacity / size);
        
        // Check if its possible to select seats based on the params
        if (minSpacing !== undefined
            && ((minSpacing + 1) * size > capacity || spacing < minSpacing))
            return undefined;
        
        let selectedSeats = [];
        if (spacing < 2) {
            // Selection based on dynamic spacing
            let alternateCap = (capacity - size) * 2;
            for (let i = 0; i < capacity; i++) {
                if ((i < alternateCap && i % 2 === 0) || i >= alternateCap) {
                    selectedSeats.push(seats[i]);
                }
            }
        } else {
            // Selection based on spacing
            for (let i = 0; i < capacity; i++) {
                if (i % spacing === 0) {
                    selectedSeats.push(seats[i]);
                }
            }
        }
        console.log('spacing: ', spacing);
        console.log('size: ', size);
        console.log('capacity: ', capacity);
        console.log('selectedSeats: ', selectedSeats.length);
        return selectedSeats;
    }

    async getSmartRandomSeats(locations, seats, minSpacing) {
        utils.seatSort(seats);
        
        // Get seats by spacing based on minSpacing
        let locSize = locations.length;
        let selectedSeats = this.getSelectedSeats(locSize, seats, minSpacing);
        if (selectedSeats === undefined || selectedSeats.length == 0)
            return undefined;
        
        // Randomly allocate users to seat
        let freeSeats = [];
        let changeSeats = [];
        for (let i = 0; i < locSize; i++) {
            let randIndex = Math.floor(Math.random() * selectedSeats.length);
            let freeSeat = selectedSeats[randIndex];
            selectedSeats.splice(randIndex, 1);

            freeSeat.emailSent = false;
            freeSeat.isBooked = true;
            freeSeat.campusId = locations[i].campus_id;
            freeSeat.user = locations[i].user;
            freeSeat.user.last_location = locations[i].host;
            
            if (freeSeat.user.last_location == freeSeat.id)
                changeSeats.push({ index: i, id: freeSeat.id });
            freeSeats.push(freeSeat);
        }
        let changeSize = changeSeats.length;
        if (changeSize == 0)
            return freeSeats;

        // Find another seat to swap with
        if (changeSize == 1) {
            let shiftFactor = 1;
            let addIndex = (changeSeats[0].index + shiftFactor) % freeSeats.length;
            changeSeats.push({
                index: addIndex,
                id: freeSeats[addIndex].id
            });
            changeSize++;
        }

        // Shift users if they get allocated to their last seat
        let tempId = changeSeats[0].id;
        for (let i = 0; i < changeSize; i++) {
            let changeSeat = changeSeats[i];
            if (i == changeSize - 1)
                freeSeats[changeSeat.index].id = tempId;
            else
                freeSeats[changeSeat.index].id = changeSeats[i + 1].id;
        }
        
        return freeSeats;
    }
}