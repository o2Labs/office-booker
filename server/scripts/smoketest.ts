import yargs from 'yargs';
import fetch from 'node-fetch';
import { stringify } from 'querystring';

const args = yargs.options({
  domain: { type: 'string', demandOption: true },
  user: { type: 'string', default: 'selfttest.user@domain.example' },
  selftestkey: { type: 'string' },
}).argv;

const authRoutes = [
  ['GET', `/api/offices`],
  ['GET', `/api/users`],
  ['GET', `/api/users/${args.user}`],
  ['PUT', `/api/users/${args.user}`],
  ['GET', `/api/bookings`],
  ['GET', `/api/bookings?${stringify({ user: args.user })}`],
  ['POST', `/api/bookings`],
  ['DELETE', `/api/bookings/123`],
  ['POST', `api/selftest`],
];

const ensureAuthFor = async (path: string, method: string = 'GET') => {
  const res = await fetch(new URL(path, args.domain).href, { method: method }).then((res) => ({
    status: res.status,
    url: res.url,
  }));
  return { status: res.status, url: res.url };
};

const ensureAuthRequired = async () => {
  const responses = await Promise.all(
    authRoutes.map(([method, route]) => ensureAuthFor(route, method))
  );
  const unexpectedResponses = responses.filter(
    (resp) => resp.status !== 401 && resp.status !== 403
  );
  if (unexpectedResponses.length > 0) {
    throw new Error(
      `API not failing with 4xx for routes:\n${unexpectedResponses
        .map((resp) => `${resp.status} ${resp.url}`)
        .join('\n')}`
    );
  }
};

const selftest = async (key: string) => {
  const response = await fetch(new URL(`/api/selftest`, args.domain).href, {
    method: 'POST',
    headers: { bearer: key },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Self-test failed with: ${body}`);
  }
};

const smoketest = async () => {
  const pendingPromises = [ensureAuthRequired()];
  if (typeof args.selftestkey === 'string') {
    pendingPromises.push(selftest(args.selftestkey));
  }
  const errors: Error[] = [];
  await Promise.all(pendingPromises.map((p) => p.catch((e) => errors.push(e))));
  if (errors.length > 0) {
    throw new Error(`Inner errors:\n${errors.map((e) => e.message).join('\n')}`);
  }
  console.log(`Service appears to be operating correctly at ${args.domain}`);
};

smoketest().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
