import {TcnftAppFullRoute} from '@frontend/src/ui/routes/app-routes';
import {defineTypedEvent} from 'element-vir';

export const TriggerTcnftAppRouteChangeEvent = defineTypedEvent<Partial<TcnftAppFullRoute>>()(
    'triggerTcnftAppRouteChange',
);

/**
 * This should only be used when the route change is replacing the current route. Meaning, when the
 * back button shouldn't be able to go back to the route that this route is replacing.
 */
export const ReplaceCurrentRouteEvent = defineTypedEvent<Partial<TcnftAppFullRoute>>()(
    'replaceCurrentRouteEvent',
);
