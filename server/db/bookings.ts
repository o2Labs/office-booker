import { Config } from '../app-config';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { attribute, table, hashKey, rangeKey } from '@aws/dynamodb-data-mapper-annotations';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { addDays } from 'date-fns';
import { AttributePath, FunctionExpression } from '@aws/dynamodb-expressions';

export interface CreateBookingModel {
  id: string;
  user: string;
  date: string;
  office: string;
  includesParking: boolean;
}

@table('bookings')
export class BookingsModel {
  @rangeKey()
  id!: string;
  @hashKey()
  user!: string;
  @attribute({ indexKeyConfigurations: { 'office-date-bookings': 'RANGE' } })
  date!: string;
  @attribute({ indexKeyConfigurations: { 'office-date-bookings': 'HASH' } })
  office!: string;
  @attribute()
  includesParking!: boolean;
  @attribute({
    defaultProvider: () => addDays(new Date(), 30).getTime(),
  })
  ttl!: number;
  @attribute({
    defaultProvider: () => new Date().toISOString(),
  })
  created!: string;
}

const buildMapper = (config: Config) =>
  new DataMapper({
    client: new DynamoDB(config.dynamoDB),
    tableNamePrefix: config.dynamoDBTablePrefix,
  });

export const getUserBookings = async (
  config: Config,
  userEmail: string
): Promise<BookingsModel[]> => {
  const mapper = buildMapper(config);
  const rows: BookingsModel[] = [];
  for await (const item of mapper.query(BookingsModel, { user: userEmail }, { limit: 50 })) {
    rows.push(item);
  }
  return rows;
};

export const queryBookings = async (
  config: Config,
  query: { office: string; date?: string }
): Promise<BookingsModel[]> => {
  const mapper = buildMapper(config);
  const rows: BookingsModel[] = [];
  const mapperQuery: Partial<BookingsModel> = { office: query.office };
  if (query.date !== undefined) {
    mapperQuery.date = query.date;
  }
  for await (const item of mapper.query(BookingsModel, mapperQuery, {
    indexName: 'office-date-bookings',
  })) {
    rows.push(item);
  }
  return rows;
};

export const getAllBookings = async (config: Config): Promise<BookingsModel[]> => {
  const mapper = buildMapper(config);
  const rows: BookingsModel[] = [];
  for await (const item of mapper.scan(BookingsModel, { limit: 500 })) {
    rows.push(item);
  }
  return rows;
};

export const createBooking = async (
  config: Config,
  booking: CreateBookingModel
): Promise<BookingsModel | undefined> => {
  const mapper = buildMapper(config);
  try {
    const created = await mapper.put(Object.assign(new BookingsModel(), booking), {
      condition: new FunctionExpression('attribute_not_exists', new AttributePath('id')),
    });
    return created;
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      return undefined;
    }
    throw err;
  }
};

export const deleteBooking = async (
  config: Config,
  id: string,
  userEmail: string
): Promise<BookingsModel | undefined> => {
  const mapper = buildMapper(config);
  const deleted = await mapper.delete(Object.assign(new BookingsModel(), { id, user: userEmail }));
  return deleted;
};

export const getBooking = async (
  config: Config,
  id: string,
  userEmail: string
): Promise<BookingsModel | undefined> => {
  const mapper = buildMapper(config);
  try {
    return await mapper.get(Object.assign(new BookingsModel(), { id, user: userEmail }));
  } catch (err) {
    if (err.name === 'ItemNotFoundException') {
      return undefined;
    } else {
      throw err;
    }
  }
};
