const dbConfig = require('../config/db.conf');
var Email = require('email-templates');
const nodeMailer = require('nodemailer');

async function getUserEmails(id, sendEmailAgain = false) {
    let cursor = await dbConfig.client.db(process.env.DB_NAME)
    .collection(id)
    .find({ 'user.id': { '$exists': true }, emailSent: sendEmailAgain, isBooked: true });
    let results = await cursor.toArray();
    return results;
}

async function updateUserEmails(id, userIds) {
    let result = await dbConfig.client.db(process.env.DB_NAME)
    .collection(id)
    .updateMany(
        { 'user.id': { '$in': userIds } },
        { $set: { emailSent: true, lastUpdated: new Date() } });
    console.log(`${result.matchedCount} documents matched the query criteria`);
    console.log(`${result.modifiedCount} documents updated`);
    return result;
}

email = {
    async send(id, options) {
        const sendEmailAgain = options.sendEmailAgain === undefined ? false : options.sendEmailAgain;
        let receivers = await getUserEmails(id, sendEmailAgain);
        // receivers = [{ _id: "lab1r1s1", user: { email: 'faraz7710.fk@gmail.com'} }];
        let recSize = receivers.length;
        if (receivers === undefined) {
            console.log("found 0 receivers to send email");
            return false;
        }
        console.log(`found ${recSize} receivers to sent email`);
        //Transporter configuration
        let transporter = nodeMailer.createTransport({
            service: 'gmail',
            // change to 42 mail service provider
            // host: 'smtpout.secureserver.net',
            // port: 465,
            // secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        let email = new Email({
            message: {
                from: 'no-reply@intra.fr'
            }
        });
        let counter = 0;
        for (let i = 0; i < recSize; i++) {
            let receiver = receivers[i];
            let result = await email.renderAll('default', {
                seatId: receiver._id
            }).catch(e => {
                console.error(e);
                return false;
            });
            await transporter.sendMail({
                from: 'no-reply@intra.fr',
                to: receiver.user.email,
                subject: result.subject,
                text: result.text,
                html: result.html
            }).catch(e => {
                console.error(e);
            });
            counter++;
        }
        console.log(`${counter} emails sent successfully.`);
        let userIds = receivers.map(x => x.user.id);
        await updateUserEmails(id, userIds);
        return true;
    }
}

module.exports = email;