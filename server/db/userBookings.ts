import { Config } from '../app-config';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { attribute, table, hashKey, rangeKey } from '@aws/dynamodb-data-mapper-annotations';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import {
  AttributePath,
  ExpressionAttributes,
  MathematicalExpression,
  UpdateExpression,
  FunctionExpression,
} from '@aws/dynamodb-expressions';
import { Arrays } from 'collection-fns';
import { addDays } from 'date-fns';

export interface UserBookings {
  email: string;
  weekCommencing: string;
  bookingCount: number;
}

const userTableName = 'user-bookings';
@table(userTableName)
export class UserBookingsModel {
  @hashKey()
  email!: string;
  @rangeKey()
  weekCommencing!: string;
  @attribute()
  bookingCount!: number;
  @attribute({
    defaultProvider: () => addDays(new Date(), 30).getTime(),
  })
  ttl!: number;
}

const buildMapper = (config: Config) =>
  new DataMapper({
    client: new DynamoDB(config.dynamoDB),
    tableNamePrefix: config.dynamoDBTablePrefix,
  });

export const getUserBookings = async (
  config: Config,
  userEmails: string[],
  weekCommencingDates: string[]
) => {
  const mapper = buildMapper(config);
  const rows: UserBookingsModel[] = [];
  const userDates = Arrays.collect(userEmails, (email) =>
    weekCommencingDates.map((weekCommencing) =>
      Object.assign(new UserBookingsModel(), { weekCommencing, email })
    )
  );
  for await (const item of mapper.batchGet(userDates)) {
    rows.push(item);
  }
  return rows;
};

export const incrementUserBookingCount = async (
  config: Config,
  userEmail: string,
  userQuota: number,
  weekCommencing: string
) => {
  const mapper = buildMapper(config);

  try {
    await mapper.put(
      Object.assign(new UserBookingsModel(), {
        email: userEmail,
        weekCommencing,
        bookingCount: 0,
      }),
      {
        condition: {
          type: 'And',
          conditions: [
            new FunctionExpression('attribute_not_exists', new AttributePath('email')),
            new FunctionExpression('attribute_not_exists', new AttributePath('date')),
          ],
        },
      }
    );
  } catch (err) {
    if (err.code !== 'ConditionalCheckFailedException') {
      throw err;
    }
  }

  const attributes = new ExpressionAttributes();
  const updateExpression = new UpdateExpression();
  updateExpression.set(
    'bookingCount',
    new MathematicalExpression(new AttributePath('bookingCount'), '+', 1)
  );

  const quotaValue = attributes.addValue(userQuota);
  const client = new DynamoDB(config.dynamoDB);
  try {
    await client
      .updateItem({
        Key: { email: { S: userEmail }, weekCommencing: { S: weekCommencing } },
        TableName: (config.dynamoDBTablePrefix || '') + userTableName,
        UpdateExpression: updateExpression.serialize(attributes),
        ExpressionAttributeNames: attributes.names,
        ExpressionAttributeValues: attributes.values,
        ConditionExpression: `bookingCount < ${quotaValue}`,
      })
      .promise();
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      return false;
    } else {
      throw err;
    }
  }

  return true;
};

export const decrementUserBookingCount = async (
  config: Config,
  userEmail: string,
  weekCommencing: string
) => {
  const attributes = new ExpressionAttributes();
  const updateExpression = new UpdateExpression();
  updateExpression.set(
    'bookingCount',
    new MathematicalExpression(new AttributePath('bookingCount'), '-', 1)
  );

  const client = new DynamoDB(config.dynamoDB);
  await client
    .updateItem({
      Key: { email: { S: userEmail }, weekCommencing: { S: weekCommencing } },
      TableName: (config.dynamoDBTablePrefix || '') + userTableName,
      UpdateExpression: updateExpression.serialize(attributes),
      ExpressionAttributeNames: attributes.names,
      ExpressionAttributeValues: attributes.values,
    })
    .promise();
};
