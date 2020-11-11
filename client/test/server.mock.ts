import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  rest.get('*', (req, res, ctx) => {
    console.log(req.method, req.url.href);
    return res(ctx.status(404));
  }),
  rest.delete('*', (req, res, ctx) => {
    console.log(req.method, req.url.href);
    return res(ctx.status(404));
  }),
  rest.post('*', (req, res, ctx) => {
    console.log(req.method, req.url.href);
    return res(ctx.status(404));
  }),
  rest.put('*', (req, res, ctx) => {
    console.log(req.method, req.url.href);
    return res(ctx.status(404));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());
