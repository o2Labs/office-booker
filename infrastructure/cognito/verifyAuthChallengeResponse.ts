import { VerifyAuthChallengeResponseTriggerEvent } from 'aws-lambda';

export const verifyAuthChallengeResponseHandler = async (event: VerifyAuthChallengeResponseTriggerEvent) => {
  const expectedAnswer = event.request.privateChallengeParameters!.secretLoginCode;

  if (event.request.challengeAnswer === expectedAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }

  return event;
};
