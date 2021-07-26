import { DefineAuthChallengeTriggerEvent } from 'aws-lambda';

export const defineAuthChallengeHandler = async (event: DefineAuthChallengeTriggerEvent) => {
  if (
    event.request.session &&
    event.request.session.length >= 3 &&
    event.request.session.slice(-1)[0].challengeResult === false
  ) {
    // The user provided a wrong answer 3 times; fail auth
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  } else if (
    event.request.session &&
    event.request.session.length &&
    event.request.session.slice(-1)[0].challengeResult === true
  ) {
    // The user provided the right answer; succeed auth
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else if (
    !event.request.userAttributes!.email ||
    (process.env.EMAIL_REGEX &&
      !new RegExp(process.env.EMAIL_REGEX).test(event.request.userAttributes!.email))
  ) {
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  } else {
    // The user did not provide a correct answer yet; present challenge
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'CUSTOM_CHALLENGE';
  }

  return event;
};
