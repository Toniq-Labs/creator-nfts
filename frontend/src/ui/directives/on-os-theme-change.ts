import {Theme} from '@frontend/src/data/theme';
import {directive, Directive, ElementPartInfo, PartInfo, PartType} from 'lit/directive.js';

/** For some reason these aren't defined in lit's types already. */
export type ExtraPartInfoProperties = {
    element: Element;
    options: {
        host: Element;
        renderBefore: Element;
        isConnected: boolean;
    };
};

function assertIsElementPartInfo(
    partInfo: PartInfo,
    directiveName: string,
): asserts partInfo is ElementPartInfo & ExtraPartInfoProperties {
    if (partInfo.type !== PartType.ELEMENT) {
        throw new Error(`${directiveName} directive can only be attached directly to an element.`);
    }
    if (!(partInfo as ElementPartInfo & ExtraPartInfoProperties).element) {
        throw new Error(`${directiveName} directive found no element`);
    }
}

export type OnOsThemeChangeCallback = (theme: Theme) => void;

const directiveName = 'onOsThemeChange';

export const onOsThemeChange = directive(
    class extends Directive {
        public readonly mediaListener = (event: MediaQueryListEvent) => {
            if (!this.callback) {
                return;
            }
            if (event.matches) {
                this.callback(Theme.dark);
            } else {
                this.callback(Theme.light);
            }
        };
        public callback: OnOsThemeChangeCallback | undefined;

        constructor(partInfo: PartInfo) {
            super(partInfo);

            assertIsElementPartInfo(partInfo, directiveName);
            window
                .matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', this.mediaListener);
        }

        public override update(partInfo: PartInfo, [callback]: [OnOsThemeChangeCallback]) {
            assertIsElementPartInfo(partInfo, directiveName);
            this.callback = callback;
            return this.render(callback);
        }

        render(callback: OnOsThemeChangeCallback) {
            return undefined;
        }
    },
);
