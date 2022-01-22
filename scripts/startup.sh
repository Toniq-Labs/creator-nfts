#!/usr/bin/env bash

set -e;

if [ ! -d ".dfx" ]; then
    /usr/bin/env ./scripts/reset-canisters.sh;
fi

npm install;
cd frontend;
npm start;