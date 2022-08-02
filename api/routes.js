const controller = require("./controller");

module.exports = (app) => {
    app.route("/").get(controller.about);
    app.route("/locations").get(controller.locations);
    app.route("/campus/:id/locations").get(controller.locByCampusId);
    app.route("/exams/:exam_id/seats").get(controller.seatsByExamId);
};