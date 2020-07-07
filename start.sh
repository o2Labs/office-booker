#!/bin/bash
set -e # stop on error

unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
unset AWS_SESSION_TOKEN
unset AWS_SECURITY_TOKEN
docker-compose up -d
run_client(){
    cd client
    yarn start
}
run_server(){
    cd server
    npx ts-node scripts/init-dynamo-local.ts
    npx nodemon local.ts
}
run_client | cat - &
run_server &
wait