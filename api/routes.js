const controller = require('./controller');

module.exports = (app) => {
    app.route("/").get(controller.getAbout);
    app.route("/test").get(controller.getTest);
    app.route("/exams_seats").get(controller.getClustersSeats);
    app.route("/exams_seats/:id").get(controller.getSeats);
    app.route("/exams_seats/:id").put(controller.upsertSeats);
    app.route("/exams_seats/:id").delete(controller.removeSeats);
    app.route("/exams_seats/:id/:user_id").get(controller.getUserSeat);
    app.route("/exams_seats/:id/:user_id").put(controller.updateUserSeat);
    app.route("/exams_seats/:id/:user_id").delete(controller.removeUserFromSeat);
    app.route("/exams_seats/:id/sent_emails").post(controller.sentEmails);
};