#!/bin/bash
set -e # stop on error

if [ -z ${1+x} ]; then echo "Usage: ./deploy.sh [STACK]"; exit 1; fi

cd infrastructure
pulumi stack select $1 --non-interactive

# Stack output will be empty if it's a fresh install
PRE_DEPLOY_STACK_OUTPUTS=`pulumi stack output --json || true`
REGION=`pulumi config get aws:region`
STACK_NAME="office-booker-$1"

# Do pre-migration check if it's not the first deploy
if [ "$PRE_DEPLOY_STACK_OUTPUTS" != "{}" ]; then
  cd ..
  AWS_REGION="$REGION" ./migrate.sh --pre-check --stack $STACK_NAME
  cd infrastructure
fi

pulumi up --yes --non-interactive
SELFTESTKEY=`pulumi config get selftest-key`
SELFTESTUSER=`pulumi config get selftest-user`
STATIC_SITE_BUCKET=`pulumi stack output staticSiteBucket`
export MIGRATE_ENV=`pulumi stack output httpEnv --show-secrets`
DOMAIN_NAME=`pulumi config get domain-name`

cd ..

aws s3 sync client/build "s3://$STATIC_SITE_BUCKET" --delete --exclude "index.html" --exclude "precache-manifest.*" --cache-control "public, max-age=31536000"
aws s3 sync client/build "s3://$STATIC_SITE_BUCKET" --delete --exclude "*" --include "index.html" --include "precache-manifest.*"

if [ "$PRE_DEPLOY_STACK_OUTPUTS" == "{}" ]; then
  # Flag if this is the first deploy
  AWS_REGION="$REGION" ./migrate.sh --first-run --stack "$STACK_NAME"
else
  AWS_REGION="$REGION" ./migrate.sh --stack "$STACK_NAME"
fi

./smoketest.sh --domain "https://$DOMAIN_NAME/" --selftestkey "$SELFTESTKEY" --user "$SELFTESTUSER"
