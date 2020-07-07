import { CognitoUserPoolEvent } from 'aws-lambda';
import { randomDigits } from 'crypto-secure-random-digit';
import { SES } from 'aws-sdk';
import { verifyText, verifyHTML } from './email';

export const createAuthChallengeHandler = async (event: CognitoUserPoolEvent) => {
  try {
    const domain = process.env.DOMAIN;
    const fromAddress = process.env.FROM_ADDRESS;
    if (typeof domain !== 'string') {
      throw new Error('No DOMAIN defined in ENV');
    }
    if (typeof fromAddress !== 'string') {
      throw new Error('No FROM_ADDRESS defined in ENV');
    }

    let secretLoginCode: string;

    if (!event.request.session || !event.request.session.length) {
      // This is a new auth session
      // Generate a new secret login code and mail it to the user
      secretLoginCode = randomDigits(6).join('');

      await sendEmail(domain, event.request.userAttributes.email, secretLoginCode, fromAddress);
    } else {
      // There's an existing session. Don't generate new digits but
      // re-use the code from the current session. This allows the user to
      // make a mistake when keying in the code and to then retry, rather
      // the needing to e-mail the user an all new code again.
      const previousChallenge = event.request.session.slice(-1)[0];

      secretLoginCode = previousChallenge.challengeMetadata!.match(/CODE-(\d*)/)![1];
    }

    // This is sent back to the client app
    event.response.publicChallengeParameters = { email: event.request.userAttributes.email };

    // Add the secret login code to the private challenge parameters
    // so it can be verified by the "Verify Auth Challenge Response" trigger
    event.response.privateChallengeParameters = { secretLoginCode };

    // Add the secret login code to the session so it is available
    // in a next invocation of the "Create Auth Challenge" trigger
    event.response.challengeMetadata = `CODE-${secretLoginCode}`;

    return event;
  } catch (error) {
    console.error(JSON.stringify({ level: 'ERROR', error: error.message + '\n' + error.stack }));
    throw error;
  }
};

async function sendEmail(
  domain: string,
  emailAddress: string,
  secretLoginCode: string,
  fromAddress: string
) {
  const params: SES.SendEmailRequest = {
    Destination: { ToAddresses: [emailAddress] },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: verifyHTML(domain, secretLoginCode),
        },
        Text: {
          Charset: 'UTF-8',
          Data: verifyText(secretLoginCode),
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Office Booker - Verify',
      },
    },
    Source: fromAddress,
  };

  console.log(JSON.stringify(params, null, 2));

  const ses = new SES();

  await ses.sendEmail(params).promise();
}
