import { Resend } from "resend";

const api_key = process.env.RESEND_API_KEY;
const resend = api_key ? new Resend(api_key) : null;

// Apparently email names can help with deliverability (at least maybe when based on email content) https://resend.com/docs/knowledge-base/how-do-i-avoid-gmails-spam-folder#establish-sending-patterns
// so if we add another reason to send emails, potentially we could use a different `from` address
// for that.
// const ameliorateEmail = "no-reply@ameliorate.app";
const ameliorateEmail = "notifications@ameliorate.app";

export const canSendEmails = () => {
  if (!api_key) {
    console.warn("Cannot send emails, RESEND_API_KEY is not set.");
    return false;
  }

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
  if (!resend) {
    console.warn("Cannot send emails, RESEND_API_KEY is not set.");
    return;
  }

  const { fromName, ...rest } = email;

  const constructedEmail = {
    from: `${fromName} <${ameliorateEmail}>`,
    ...rest,
  };

  const { data, error } = await resend.emails.send(constructedEmail);

  if (error) {
    console.error("Error sending email:", data, error);
  }
};

export const sendAllEmails = async (emails: Email[]) => {
  await Promise.all(emails.map(sendEmail));
};
