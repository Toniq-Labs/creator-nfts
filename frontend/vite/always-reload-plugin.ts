import chalk from 'chalk';
import {existsSync, lstatSync, readlinkSync} from 'fs';
import {relative} from 'path';
import {PluginOption} from 'vite';

/**
 * Include actual paths and symlinked target paths if they exist.
 *
 * This is needed because when removing files from the watcher, sym links have be removed with the
 * path to the symlink itself AND the path to the symlink target or the path will still be watched.
 */
function mapToActualPaths(paths: Readonly<string[]>): Readonly<string[]> {
    return paths.reduce((accum, path) => {
        if (existsSync(path)) {
            if (lstatSync(path).isSymbolicLink()) {
                console.info('reading symlink from', path);
                // sym links AND the original path both need to be included
                return accum.concat(readlinkSync(path), path);
            } else {
                return accum.concat(path);
            }
        } else {
            return accum;
        }
    }, [] as string[]);
}

/**
 * There are similar plugins out there that try to do this but they aren't aggressive enough. This
 * plugin literally always reloads on save, no questions asked.
 */
export function alwaysReloadPlugin(
    config: Partial<{
        exclusions: string[];
        /** Inclusions apply after exclusions so they will override exclusions. */
        inclusions: string[];
        root: string;
    }> = {},
): PluginOption {
    return {
        name: 'alwaysReloadPlugin',
        apply: 'serve',
        config: () => ({server: {watch: {disableGlobbing: false}}}),
        configureServer({watcher, ws, config: {logger}}) {
            const {root = process.cwd(), inclusions = [], exclusions = []} = config;
            let callingAlready = false;
            let loggedAlready = false;

            const reloadCallback = (path: string) => {
                if (!loggedAlready) {
                    loggedAlready = true;
                    // log watched stuff so that we can make sure it's not watching too much
                    // console.info({watched: watcher.getWatched()});
                }
                // prevent duplicate calls cause the watcher is very eager to call callbacks multiple times in a row
                if (!callingAlready) {
                    callingAlready = true;
                    ws.send({
                        type: 'full-reload',
                        path: '*',
                    });
                    logger.info(
                        `${chalk.green('page reload')} ${chalk.dim(relative(root, path))}`,
                        {clear: true, timestamp: true},
                    );
                    /**
                     * Debounce reloads calls so that they don't get spammed. If you're saving
                     * faster than this, then what the heck are you doing anyway?
                     */
                    setTimeout(() => {
                        callingAlready = false;
                    }, 100);
                }
            };

            if (exclusions.length) {
                watcher.unwatch(mapToActualPaths(exclusions));
                // ignore macOS file system metadata stuff
                watcher.unwatch('./**/.DS_Store');
            }
            if (inclusions.length) {
                watcher.add(inclusions);
            }
            if (!watcher.listeners('change').includes(reloadCallback)) {
                watcher.on('change', reloadCallback);
                watcher.on('add', reloadCallback);
            }
        },
    };
}
