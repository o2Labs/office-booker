#!/bin/bash
set -e # stop on error

yarn --cwd server --non-interactive --silent
yarn --cwd alerts --non-interactive --silent
yarn --cwd infrastructure --non-interactive --silent
yarn --cwd client --non-interactive --silent
