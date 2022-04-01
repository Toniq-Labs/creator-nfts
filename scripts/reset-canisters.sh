#!/usr/bin/env bash

echo "sudo required for 'killall dfx'"
sudo killall dfx;

# wait for the killall to finish
sleep 1

set -e;

rm -rf .dfx/local/canisters;
rm -rf .vessel;

dfx start --clean --emulator --background;
dfx deploy nft;