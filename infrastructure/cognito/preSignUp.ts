import { CognitoUserPoolTriggerEvent } from 'aws-lambda';

export const preSignUpHandler = async (event: CognitoUserPoolTriggerEvent) => {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  return event;
};
