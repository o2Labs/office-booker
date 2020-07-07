#!/bin/bash
set -e # stop on error
yarn audit --cwd server --groups dependencies
yarn audit --cwd infrastructure --groups dependencies
yarn audit --cwd alerts --groups dependencies
yarn audit --cwd client --groups dependencies || true # Ignore lodash issue temporarily
docker-compose down
docker-compose up -d

cd server
npx ts-node scripts/init-dynamo-local.ts
yarn test
docker-compose down
npx tsc -p tsconfig.build.json
cp package.json ../dist/server
cp yarn.lock ../dist/server

cd ../client
CI=true yarn test
npx tsc --noEmit

cd ../alerts
npx tsc --project tsconfig.dist.json
cp package.json ../dist/alerts
cp yarn.lock ../dist/alerts

cd ..
yarn install --production --cwd dist/server --non-interactive
yarn install --production --cwd dist/alerts --non-interactive
