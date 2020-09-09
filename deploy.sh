#!/bin/bash
set -e # stop on error

if [ -z ${1+x} ]; then echo "Usage: ./deploy.sh [STACK]"; exit 1; fi

cd infrastructure
pulumi stack select $1 --non-interactive

STACK_OUTPUTS=`pulumi stack output --json || true`
if [ "$STACK_OUTPUTS" == "{}" ]; then
  ./migrate.sh --first-run --stack "office-booker-$1"
else
  ./migrate.sh --stack "office-booker-$1"
fi

pulumi up --yes --non-interactive
SELFTESTKEY=`pulumi config get selftest-key`
SELFTESTUSER=`pulumi config get selftest-user`
STATIC_SITE_BUCKET=`pulumi stack output staticSiteBucket`
DOMAIN_NAME=`pulumi config get domain-name`

cd ..
aws s3 sync client/build "s3://$STATIC_SITE_BUCKET" --delete --exclude "index.html" --exclude "precache-manifest.*" --cache-control "public, max-age=31536000"
aws s3 sync client/build "s3://$STATIC_SITE_BUCKET" --delete --exclude "*" --include "index.html" --include "precache-manifest.*"
./smoketest.sh --domain "https://$DOMAIN_NAME/" --selftestkey "$SELFTESTKEY" --user "$SELFTESTUSER"
