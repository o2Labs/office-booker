#!/bin/bash
set -e # stop on error

if [ -z ${1+x} ]; then echo "Usage: ./deploy.sh [STACK]"; exit 1; fi

cd infrastructure
pulumi stack select $1 --non-interactive
pulumi up --yes --non-interactive
SELFTESTKEY=`pulumi config get selftest-key`
SELFTESTUSER=`pulumi config get selftest-user`
STATIC_SITE_BUCKET=`pulumi stack output staticSiteBucket`
DOMAIN_NAME=`pulumi config get domain-name`
export REACT_APP_AUTH_REGION=`pulumi config get aws:region`
export REACT_APP_AUTH_USER_POOL_ID=`pulumi stack output cognitoPoolId`
export REACT_APP_AUTH_WEB_CLIENT_ID=`pulumi stack output cognitoAuthClientId`
export REACT_APP_EMAIL_REGEX=`pulumi config get email-regex`
export REACT_APP_ADVANCE_BOOKING_DAYS=`pulumi config get advance-booking-days`

cd ..
yarn --cwd client build
aws s3 sync client/build "s3://$STATIC_SITE_BUCKET" --delete --exclude "index.html" --exclude "precache-manifest.*" --cache-control "public, max-age=31536000"
aws s3 sync client/build "s3://$STATIC_SITE_BUCKET" --delete --exclude "*" --include "index.html" --include "precache-manifest.*"
./smoketest.sh --domain "https://$DOMAIN_NAME/" --selftestkey "$SELFTESTKEY" --user "$SELFTESTUSER"
