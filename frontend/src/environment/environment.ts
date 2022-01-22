function hasNodeEnv(
    input: Window & typeof globalThis,
): input is Window & typeof globalThis & {process: {env: {NODE_ENV: string}}} {
    return 'process' in input && 'env' in input.process && 'NODE_ENV' in input.process.env;
}

const isDev = hasNodeEnv(window) && process.env.NODE_ENV?.toLowerCase().startsWith('dev');

if (isDev) {
    console.info(`Running in dev mode.`);
}

export const actorHostConfig = {
    dev: window.location.origin,
    prod: 'https://raw.ic0.app',
};

export const environment = {
    nftCanisterId: process.env.NFT_CANISTER_ID as string,
    actorHost: isDev ? actorHostConfig.dev : actorHostConfig.prod,
    isDev,
    // cspell:disable-next-line
    ledgerId: 'ryjl3-tyaaa-aaaaa-aaaba-cai', // this is the ledger canister id in prod
};
