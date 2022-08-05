const controller = require('./controller');

module.exports = (app) => {
    app.route("/test").get(controller.getTest);
    
    // Info about the seat selector microservice
    app.route("/").get(controller.getAbout);
    app.route("/about").get(controller.getAbout);
    
    // Getting all exam seats
    app.route("/exams_seats").get(controller.getClustersSeats);
    
    // Generating seats by exam
    app.route("/exams_seats/:id/generate").get(controller.oneTimeSeatsGen);
    app.route("/exams_seats/:id/generate").post(controller.seatsGenerator);
    
    // Adding and getting seats by exam
    app.route("/exams_seats/:id").get(controller.getSeats);
    app.route("/exams_seats/:id").put(controller.upsertSeats);
    app.route("/exams_seats/:id").delete(controller.removeSeats);
    
    // Adding and getting seats by users
    app.route("/exams_seats/:id/:user_id").get(controller.getUserSeat);
    app.route("/exams_seats/:id/:user_id").put(controller.updateUserSeat);
    app.route("/exams_seats/:id/:user_id").delete(controller.removeUserFromSeat);
    
    // Send emails to users by exam
    app.route("/exams_seats/:id/sent_emails").post(controller.sentEmails);
};