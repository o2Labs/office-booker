import { Config } from '../app-config';
import { CognitoIdentityServiceProvider, AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { getAllUsers, setUser } from '../db/users';

export type CognitoUser = {
  email: string;
  created: string;
};

const getAllCognitoUsers = async (config: Config): Promise<CognitoUser[]> => {
  if (config.authConfig.type !== 'cognito') {
    return [];
  }
  const { cognitoUserPoolId } = config.authConfig;
  const cognito = new CognitoIdentityServiceProvider();
  const emails: CognitoUser[] = [];
  let paginationToken: string | undefined = undefined;
  do {
    const response: PromiseResult<
      CognitoIdentityServiceProvider.ListUsersResponse,
      AWSError
    > = await cognito
      .listUsers({
        UserPoolId: cognitoUserPoolId,
        AttributesToGet: ['email'],
        PaginationToken: paginationToken,
      })
      .promise();
    paginationToken = response.PaginationToken;
    for (const user of response.Users ?? []) {
      const email = user.Attributes?.find((att) => att.Name === 'email')?.Value;
      if (
        email !== undefined &&
        user.Enabled !== undefined &&
        user.UserCreateDate &&
        user.UserLastModifiedDate
      ) {
        emails.push({
          email,
          created: user.UserCreateDate.toISOString(),
        });
      }
    }
  } while (paginationToken !== undefined);
  return emails;
};

export const saveCognitoUsersToDb = async (config: Config) => {
  const allDbUsers = await getAllUsers(config);
  const dbUserEmails = new Set(allDbUsers.map((u) => u.email));
  const allCognitoUsers = await getAllCognitoUsers(config);
  for (const cognitoUser of allCognitoUsers) {
    if (!dbUserEmails.has(cognitoUser.email)) {
      await setUser(config, { email: cognitoUser.email, created: cognitoUser.created });
    }
  }
};
