# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Run migrations in the same AWS region as the Pulumi stack.
- Fix bug which shows current user bookings in place of other user's bookings.

## [1.1.0] - 2020-09-14

- Introduced users migration to store all active users in DynamoDB.
- Use custom registration endpoint to ensure username are validated before signing up

## [1.0.0] - 2020-06-07

First open source release - open preview.
