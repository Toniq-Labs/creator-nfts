import {applyThemeColors} from '@frontend/src/ui/styles/theme-vars';
import {Overwrite} from 'augment-vir';
import {
    css,
    defineFunctionalElement,
    EventsInitMap,
    FunctionalElement,
    FunctionalElementInit,
    PropertyInitMapBase,
    requireAllCustomElementsToBeFunctionalElement,
} from 'element-vir';

/**
 * Require all children custom elements to be defined through the interface in this file.
 *
 * Remove this to use other libraries interchangeably.
 */
requireAllCustomElementsToBeFunctionalElement();

/** Tcnft = Toniq Creator NFT */
const tagPrefix = `tcnft-`;
export type CreatorNftTagName = `${typeof tagPrefix}${string}`;

export function defineCreatorNftElement<
    EventsInitGeneric extends EventsInitMap = {},
    PropertyInitGeneric extends PropertyInitMapBase = {},
>(
    functionalElementInit: Overwrite<
        FunctionalElementInit<PropertyInitGeneric, EventsInitGeneric>,
        {tagName: CreatorNftTagName}
    >,
): FunctionalElement<PropertyInitGeneric, EventsInitGeneric> {
    if (functionalElementInit.tagName === tagPrefix) {
        throw new Error(
            `A tag name must exist after the prefix for ${defineCreatorNftElement.name}: "${functionalElementInit.tagName}"`,
        );
    }
    return defineFunctionalElement<EventsInitGeneric, PropertyInitGeneric>({
        ...functionalElementInit,
        styles: css`
            :host {
                ${applyThemeColors}
                background-color: unset;
            }

            ${functionalElementInit.styles || css``}
        `,
    });
}
