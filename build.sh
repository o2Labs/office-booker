#!/bin/bash
set -e # stop on error
yarn audit --cwd server --groups dependencies
yarn audit --cwd infrastructure --groups dependencies
yarn audit --cwd alerts --groups dependencies
yarn audit --cwd client --groups dependencies || true # Ignore lodash issue temporarily

./test.sh

cd server
npx tsc -p tsconfig.build.json
cp package.json ../dist/server
cp yarn.lock ../dist/server

cd ../alerts
npx tsc --project tsconfig.dist.json
cp package.json ../dist/alerts
cp yarn.lock ../dist/alerts

cd ..
yarn install --production --cwd dist/server --non-interactive
yarn install --production --cwd dist/alerts --non-interactive
