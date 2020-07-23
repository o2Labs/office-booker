#!/bin/bash
set -e # stop on error

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