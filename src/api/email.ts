import sendgridMail from "@sendgrid/mail";

const api_key = process.env.SENDGRID_API_KEY;
if (api_key) {
  sendgridMail.setApiKey(api_key);
}

const ameliorateEmail = "no-reply@ameliorate.app";

export const canSendEmails = () => {
  if (!api_key) return false;

  return true;
};

export interface Email {
  /**
   * e.g. if this is triggered by someone's comment, put their name in the from display field: "from: [fromName] <[ameliorateEmail]>"
   */
  fromName: string;
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (email: Email) => {
  await sendgridMail.send({
    from: `${email.fromName} <${ameliorateEmail}>`,
    ...email,
  });
};

export const sendAllEmails = async (emails: Email[]) => {
  await Promise.all(emails.map(sendEmail));
};
