const controller = require("./controller");

module.exports = (app) => {
    app.route("/").get(controller.getAbout);
    app.route("/exams_seats").get(controller.getGroupsSeats);
    app.route("/exams_seats/:id").get(controller.getSeats);
    app.route("/exams_seats/:id/:user_id").get(controller.getUserSeat);
    app.route("/exams_seats/:id/:user_id").post(controller.updateUserSeat);
};