#!/usr/bin/env bash


git grep 'nomerge' -- ':!*run-tests.sh' ':!.cspell.json';

if [ "$?" -ne 1 ]; then
    echo -e "\x1b[31m\x1b[1mCode contains \"nomerge\" keyword.\x1b[0m"
    exit 1
fi

set -e;

npm ci
npm run format check
npm run spellcheck

# frontend tests
cd frontend;
npm ci
npm run test
npm run build

# other tests here if they're ever made