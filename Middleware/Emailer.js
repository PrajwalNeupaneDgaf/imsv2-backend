require('dotenv').config(); // To load environment variables from a .env file
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (userEmail, verificationToken) => {
    const verificationLink = `http://localhost:5173/email-verification/${verificationToken}`;

    const msg = {
        to: userEmail,
        from: 'imsprojectbyus@gmail.com', // Your verified sender email
        subject: 'Email Verification',
        text: `Please verify your email by clicking the link: ${verificationLink}`,
        html: `<p>Please verify your email by clicking the link: <a href="${verificationLink}">Verify Email</a></p>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email', error.response ? error.response.body : error);
    }
};

module.exports = sendVerificationEmail;
