import {
    extractFunctionalElement,
    FunctionalElementInstance,
    PropertyInitMapBase,
    StaticElementPropertyDescriptor,
} from 'element-vir';
import {noChange} from 'lit';
import {directive, Directive, PartInfo} from 'lit/directive.js';

/**
 * The directive generics (in listenDirective) are not strong enough to maintain their values. Thus,
 * the directive call is wrapped in this function.
 */
export function assignWithDebounce<PropName extends string, PropValue>(
    propertyDescriptor: StaticElementPropertyDescriptor<PropName, PropValue>,
    value: typeof propertyDescriptor['initValue'],
    /** Milliseconds for debouncing. */
    debounceMs = 1000,
) {
    return assignWithDebounceDirective(propertyDescriptor.propName, value, debounceMs);
}

const assignWithDebounceDirective = directive(
    class extends Directive {
        public readonly element: FunctionalElementInstance<PropertyInitMapBase>;
        public timeoutId: number | undefined;
        public lastSetTime: number = 0;
        public lastValue: unknown;
        public lastPropName: string | undefined;

        constructor(partInfo: PartInfo) {
            super(partInfo);

            this.element = extractFunctionalElement(partInfo, 'assign');
        }

        public setLastValue(propName: string | undefined, value: unknown) {
            this.lastValue = value;
            this.lastPropName = propName;
        }

        public setValue(propName: string | undefined, value: unknown) {
            if (propName == undefined) {
                return;
            }
            this.lastSetTime = Date.now();
            this.setLastValue(undefined, undefined);
            if (!(propName in this.element.instanceProps)) {
                throw new Error(
                    `${this.element.tagName} element has no property of name "${propName}"`,
                );
            }
            this.element.instanceProps[propName] = value;
        }

        public render(propName: string, value: unknown, debounceMs: number) {
            // only propagate value sets if there is currently no debounce timeout
            if (this.timeoutId == undefined) {
                // if X is assign statements that get fired, Y is after the debounce timeout finishes but before the cooldown time runs out. The remaining cooldown time represents how long Y should wait before firing again at the next X.
                //    X -> timeout debounce -> X   Y ->        X
                const diffFromLastSet = Date.now() - this.lastSetTime;
                const remainingCooldownMs =
                    diffFromLastSet < debounceMs ? debounceMs - diffFromLastSet : 0;

                // don't set the value straight away if we're on cooldown still from the last debounce
                if (!remainingCooldownMs) {
                    this.setValue(propName, value);
                }
                this.timeoutId = window.setTimeout(() => {
                    this.timeoutId = undefined;
                    /**
                     * This will be a no-op if lastPropName hasn't been updated since setValue
                     * clears it to undefined.
                     */
                    this.setValue(this.lastPropName, this.lastValue);
                }, remainingCooldownMs || debounceMs);
            } else {
                this.setLastValue(propName, value);
            }
            return noChange;
        }
    },
);
