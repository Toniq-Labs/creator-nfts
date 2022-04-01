import * as nftCandid from '@frontend/dfx-link/local/canisters/nft/nft.did.js';
import {ArrayElement} from 'augment-vir';

export type BigIntPropsToNumber<T> = {
    [Prop in keyof T]: T[Prop] extends bigint ? number : T[Prop];
};

export const emptyData = {
    categories: {},
    creators: {},
    posts: {},
} as const;

// same as RawBulkCreatorData but with all BigInt data turned into numbers
export type RawContentCreatorDataWithFixedBigIntProps = {
    creators: [string, Creator][];
    categories: [string, CreatorCategory][];
    posts: [string, CreatorPost][];
};

export type CreatorCategory = BigIntPropsToNumber<nftCandid.RawCreatorCategory>;
export type Creator = nftCandid.RawCreator;
export type CreatorPost = BigIntPropsToNumber<nftCandid.RawCreatorPost>;

export type ContentCreatorDashboardData = {
    [P in keyof RawContentCreatorDataWithFixedBigIntProps]: Record<
        string,
        ArrayElement<RawContentCreatorDataWithFixedBigIntProps[P]>[1]
    >;
};
