#!/bin/bash
set -e # stop on error

unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
unset AWS_SESSION_TOKEN
unset AWS_SECURITY_TOKEN
export AWS_ACCESS_KEY_ID=fakeKeyID
export AWS_SECRET_ACCESS_KEY=fakeAccessKey
run_tests() {
    cd server
    yarn test
}
run_tests