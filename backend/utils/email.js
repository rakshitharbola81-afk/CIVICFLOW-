const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendComplaintEmail = async (options) => {
    const data = await resend.emails.send({
        from: "CivicFlow <onboarding@resend.dev>",
        to: options.email,
        subject: options.subject,
        html: options.html,
    });

    console.log("Resend Email:", data);
};