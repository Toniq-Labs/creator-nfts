import {ContentCreatorDashboardData} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {defineTypedEvent} from 'element-vir';

export const UpdateCreatorContentEvent = defineTypedEvent<
    ContentCreatorDashboardData | undefined
>()('updateCreatorContent');
