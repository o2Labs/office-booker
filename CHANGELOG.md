# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0]

- Fix TTL bug resulting in the data retention policy not being followed.
- Add migration to fix TTL on existing database entries.
- Add a basic stats page showing all booking counts per office, per day.
- Improved usability and accessibility of login journey.
- Increase test coverage of critical path to booking.

## [2.0.2]

- Add check for user before attempting to retrieve office details.
- Upgrade all packages.
- Update header text to link to home.
- Improve test coverage to check we can load and interact with the admin screen.

## [2.0.1]

- Disable cancelling previous bookings.
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
