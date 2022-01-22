import {resolve} from 'path';
import {defineConfig} from 'vite';
import dfxJson from '../../dfx.json';
import {alwaysReloadPlugin} from './always-reload-plugin';
import {getCanisterDefinitions} from './canister-data';

//
// environment config
//

const isDev = process.env['DFX_NETWORK'] !== 'ic';
// Gets the port dfx is running on from dfx.json
const DFX_PORT = dfxJson.networks.local.bind.split(':')[1];
const nodeEnv = isDev ? 'development' : 'production';

//
// vite configuration
//

// See guide on how to configure Vite at: https://vitejs.dev/config/
const viteConfig = defineConfig({
    plugins: [
        alwaysReloadPlugin({
            exclusions: [
                // ignore dfx stuff cause most of it isn't used in the frontend
                './dfx-link',
                './dist',
            ],
            inclusions: [
                // include the canister information that we actually use in the frontend
                './dfx-link/local/**/*',
            ],
        }),
    ],
    resolve: {
        /**
         * Allow the frontend to access dfx-link which links to outside of ./frontend without
         * inserting complete absolute paths into the browser in dev.
         */
        preserveSymlinks: true,
        alias: {
            /**
             * Allow us to use @frontend/src as a quick path to frontend/src so we can avoid
             * potentially crazy relative imports with lots of "../".
             */
            '@frontend/src': resolve('./src'),
            '@frontend/dfx-link': resolve('./dfx-link'),
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve('index.html'),
            },
        },
    },
    server: {
        fs: {
            allow: ['./node_modules', './src', './dfx-link'],
        },
        proxy: {
            // This proxies all http requests made to /api to our running dfx instance
            '/api': {
                target: `http://localhost:${DFX_PORT}`,
                changeOrigin: true,
            },
        },
    },
    // Here we define global constants (global in the scope of index.html)
    define: {
        ...getCanisterDefinitions(isDev),
        // the code generated by dfx relies on process.env being set
        'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    },
    clearScreen: false,
});

export default viteConfig;