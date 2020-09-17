# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Run migrations in the same AWS region as the Pulumi stack.
- Fix bug which shows current user bookings in place of other user's bookings.

## [2.0.0] - 2020-09-14

- Re-enable API write access.
- Use newly migrated DB (using officeId).
- Require officeId to be specified in config (to avoid renaming issues).
- Disable public Cognito registrations.

## [1.2.0] - 2020-09-14

- Migrate DB to store all bookings with office ID rather than office name.
- Temporarily set API to readonly mode to avoid changes during migration.

## [1.1.0] - 2020-09-14

- Introduced users migration to store all active users in DynamoDB.
- Use custom registration endpoint to ensure username are validated before signing up

## [1.0.0] - 2020-06-07

First open source release - open preview.
