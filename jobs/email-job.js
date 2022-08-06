var Email = require('email-templates');
const nodeMailer = require('nodemailer');

module.exports = email = {
    async send(emailTemplateName, receivers) {
        let emailsSent = [];
        receivers = [{ _id: "lab1r1s1", user: { email: 'faraz7710.fk@gmail.com'} }];
        let recSize = receivers.length;
        if (receivers === undefined) {
            console.log("found 0 receivers to send email");
            return undefined;
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
        let email = new Email();
        let counter = 0;
        for (let i = 0; i < recSize; i++) {
            let receiver = receivers[i];
            try {
                let result = await email.renderAll(emailTemplateName, {
                    seatId: receiver._id
                });
                await transporter.sendMail({
                    from: 'no-reply@intra.fr',
                    to: receiver.user.email,
                    subject: result.subject,
                    text: result.text,
                    html: result.html
                });
                emailsSent.push(true);
                counter++;
            } catch(e) {
                console.error(e);
                emailsSent.push(false);
            }
        }
        console.log(`${counter} emails sent successfully.`);
        return emailsSent;
    }
}