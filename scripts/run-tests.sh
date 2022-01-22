#!/usr/bin/env bash

set -e;

npm ci
npm run format check
npm run spellcheck

# frontend tests
cd frontend;
npm ci
npm run test
npm run build