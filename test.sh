#!/bin/bash
set -e # stop on error

unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
export AWS_ACCESS_KEY_ID=fakeKeyID
export AWS_SECRET_ACCESS_KEY=fakeAccessKey

docker-compose up -d

cd server
npx tsc --noEmit
yarn test

cd ../client
npx tsc --noEmit
yarn test

cd ../alerts
npx tsc --noEmit