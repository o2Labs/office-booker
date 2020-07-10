import { Config, OfficeQuota } from '../app-config';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { attribute, table, hashKey, rangeKey } from '@aws/dynamodb-data-mapper-annotations';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { Arrays } from 'collection-fns';

import {
  AttributePath,
  ExpressionAttributes,
  MathematicalExpression,
  UpdateExpression,
  FunctionExpression,
} from '@aws/dynamodb-expressions';
import { addDays } from 'date-fns';

export interface OfficeBooking {
  name: string;
  date: string;
  bookingCount: number;
  parkingCount: number;
}

@table('office-bookings')
export class OfficeBookingModel {
  @hashKey()
  name!: string;
  @rangeKey()
  date!: string;
  @attribute()
  bookingCount!: number;
  @attribute()
  parkingCount!: number;
  @attribute({
    defaultProvider: () => addDays(new Date(), 365).getTime(),
  })
  ttl!: number;
}

const buildMapper = (config: Config) =>
  new DataMapper({
    client: new DynamoDB(config.dynamoDB),
    tableNamePrefix: config.dynamoDBTablePrefix,
  });

export const incrementOfficeBookingCount = async (
  config: Config,
  office: OfficeQuota,
  date: string,
  includeParking: boolean
) => {
  const mapper = buildMapper(config);

  try {
    await mapper.put(
      Object.assign(new OfficeBookingModel(), {
        name: office.name,
        date,
        bookingCount: 0,
        parkingCount: 0,
      }),
      {
        condition: {
          type: 'And',
          conditions: [
            new FunctionExpression('attribute_not_exists', new AttributePath('name')),
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

  let parkingQuotaValue;

  if (includeParking) {
    updateExpression.set(
      'parkingCount',
      new MathematicalExpression(new AttributePath('parkingCount'), '+', 1)
    );
    parkingQuotaValue = attributes.addValue(office.parkingQuota);
  }

  const quotaValue = attributes.addValue(office.quota);
  const client = new DynamoDB(config.dynamoDB);
  try {
    const checkParkingQuota = includeParking ? `AND parkingCount < ${parkingQuotaValue}` : '';
    await client
      .updateItem({
        Key: { name: { S: office.name }, date: { S: date } },
        TableName: (config.dynamoDBTablePrefix || '') + 'office-bookings',
        UpdateExpression: updateExpression.serialize(attributes),
        ExpressionAttributeNames: attributes.names,
        ExpressionAttributeValues: attributes.values,
        ConditionExpression: `bookingCount < ${quotaValue} ${checkParkingQuota}`,
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

export const decrementOfficeBookingCount = async (
  config: Config,
  officeName: string,
  date: string,
  includeParking: boolean
) => {
  const attributes = new ExpressionAttributes();
  const updateExpression = new UpdateExpression();
  updateExpression.set(
    'bookingCount',
    new MathematicalExpression(new AttributePath('bookingCount'), '-', 1)
  );
  if (includeParking) {
    updateExpression.set(
      'parkingCount',
      new MathematicalExpression(new AttributePath('parkingCount'), '-', 1)
    );
  }

  const client = new DynamoDB(config.dynamoDB);
  await client
    .updateItem({
      Key: { name: { S: officeName }, date: { S: date } },
      TableName: (config.dynamoDBTablePrefix || '') + 'office-bookings',
      UpdateExpression: updateExpression.serialize(attributes),
      ExpressionAttributeNames: attributes.names,
      ExpressionAttributeValues: attributes.values,
    })
    .promise();
};

export const getOfficeBookings = async (
  config: Config,
  dates: string[],
  offices: string[]
): Promise<OfficeBookingModel[]> => {
  const mapper = buildMapper(config);
  const rows: OfficeBookingModel[] = [];
  const officeDates = Arrays.collect(offices, (office) =>
    dates.map((date) => Object.assign(new OfficeBookingModel(), { date, name: office }))
  );
  for await (const item of mapper.batchGet(officeDates)) {
    rows.push(item);
  }
  return rows;
};
