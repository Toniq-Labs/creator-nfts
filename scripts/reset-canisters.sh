#!/usr/bin/env bash
sudo killall dfx;

# wait for the killall to finish
sleep 1

set -e;

rm -rf .dfx/local/canisters;
rm -rf .vessel;

dfx start --clean --emulator --background;
dfx deploy nft;