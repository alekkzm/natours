const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// using like this: new Email(user, url).sendWelcome()

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = process.env.EMAIL_FROM;
    }

    createTransport() {
        if (process.env.NODE_ENV === 'production') {
            //sendgrid
            return 0;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {

        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.htmlToText(html)
        };

        await this.createTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }
};

// const sendEmail = async options => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });

//     const mailOptions = {
//         from: 'Natours.io <no-reply@natours.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     };

//     const rslt = await transporter.sendMail(mailOptions);
//     console.log(rslt);
// };

// module.exports = sendEmail
