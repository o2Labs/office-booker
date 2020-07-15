#!/bin/bash
set -e # stop on error
if [ -z ${1+x} ]; then echo "Usage: ./make-env.sh [STACK]"; exit 1; fi
cd infrastructure
pulumi stack select $1
AWS_REGION=`pulumi config get aws:region`
COGNITO_USER_POOL_ID=`pulumi stack output cognitoPoolId`
COGNITO_CLIENT_ID=`pulumi stack output cognitoAuthClientId`
SYSTEM_ADMIN_EMAILS=`pulumi stack output systemAdminEmails`
EMAIL_REGEX=`pulumi config get email-regex`
OFFICE_QUOTAS=`pulumi stack output officeQuotas`
DEFAULT_WEEKLY_QUOTA=`pulumi config get default-weekly-quota`
ADVANCE_BOOKING_DAYS=`pulumi config get advance-booking-days`
DATA_RETENTION_DAYS=`pulumi config get log-retention`
echo -e "REACT_APP_SHOW_TEST_BANNER=true\nREACT_APP_AUTH_REGION=$AWS_REGION\nREACT_APP_AUTH_USER_POOL_ID=$COGNITO_USER_POOL_ID\nREACT_APP_AUTH_WEB_CLIENT_ID=$COGNITO_CLIENT_ID\nREACT_APP_EMAIL_REGEX=$EMAIL_REGEX\nREACT_APP_ADVANCE_BOOKING_DAYS=$ADVANCE_BOOKING_DAYS" > ../client/.env.local
echo -e "SHOW_TEST_BANNER=true\nSYSTEM_ADMIN_EMAILS=$SYSTEM_ADMIN_EMAILS\nEMAIL_REGEX=$EMAIL_REGEX\nCOGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID\nREGION=$AWS_REGION\nOFFICE_QUOTAS=$OFFICE_QUOTAS\nDEFAULT_WEEKLY_QUOTA=$DEFAULT_WEEKLY_QUOTA\nADVANCE_BOOKING_DAYS=$ADVANCE_BOOKING_DAYS\nDATA_RETENTION_DAYS=$DATA_RETENTION_DAYS\nCOGNITO_CLIENT_ID=$COGNITO_CLIENT_ID"  > ../server/.env
