#!/bin/bash
set -e # stop on error
yarn audit --cwd server --groups dependencies
yarn audit --cwd infrastructure --groups dependencies
yarn audit --cwd alerts --groups dependencies
yarn audit --cwd client

./test.sh

rm -rf dist
rm -rf client/build

cd server
npx tsc -p tsconfig.build.json
cp package.json ../dist/server
cp yarn.lock ../dist/server

cd ../client
yarn build

cd ../alerts
npx tsc --project tsconfig.dist.json
cp package.json ../dist/alerts
cp yarn.lock ../dist/alerts

cd ..
yarn install --production --cwd dist/server --non-interactive --frozen-lockfile
yarn install --production --cwd dist/alerts --non-interactive --frozen-lockfile
