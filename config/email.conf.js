var node = require('node-schedule');
var email = require('../jobs/email-job');

// TODO:
// Created a schedule class to automatically send emails to students
// based on a particular time specified by the admin.
// However this feature requires a bit more time to implement.
// Have done some basic setup but need to integrate with db and add features
// like rescheduling, stopping the job if the exam gets cancelled or delayed, etc.

module.exports = class EmailConfig {

    static map = {};

    static createEmailJob(id, cron) {
        if (EmailConfig.map[id] !== undefined)
            cancelJob(id);
        EmailConfig.map[id] = node.scheduleJob(cron, () => {
            console.log(`Starting email job for id ${id}`);
            email.send(id).catch(err => console.error(err));
        });
        return EmailConfig.map[id];
    }

    static cancelJob(id) {
        EmailConfig.map[id].stop();
    }
}