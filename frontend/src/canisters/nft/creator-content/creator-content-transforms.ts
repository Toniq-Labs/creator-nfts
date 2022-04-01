import * as nftCandid from '@frontend/dfx-link/local/canisters/nft/nft.did.js';
import {BigIntPropsToNumber} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {ArrayElement, getObjectTypedKeys, Overwrite} from 'augment-vir';
import {
    ContentCreatorDashboardData,
    CreatorCategory,
    RawContentCreatorDataWithFixedBigIntProps,
} from './creator-content-types';

/**
 * Data in here goes through three phases:
 *
 * 1. Raw data from canister with weird layout and some BigInt properties
 * 2. Data with weird layout from step 1 with BigInt properties converted to number properties
 * 3. Data from step 2 with weird layout fixed
 */

type DataPropsWithBigInt = {
    posts: [string, Record<string, any>][];
    categories: [string, Record<string, any>][];
};

function bigIntPropsToNumber<T>(input: T): BigIntPropsToNumber<T> {
    return getObjectTypedKeys(input).reduce((accum, currentKey) => {
        const value = input[currentKey];
        accum[currentKey] = (typeof value === 'bigint' ? Number(value) : value) as any;
        return accum;
    }, {} as BigIntPropsToNumber<T>);
}

function bigIntTupleToNumberTuple<T>(input: [string, T]): [string, BigIntPropsToNumber<T>] {
    return [
        input[0],
        bigIntPropsToNumber(input[1]),
    ];
}

type FixedBigIntContentDataProps<T extends DataPropsWithBigInt> = Overwrite<
    T,
    {
        posts: [string, BigIntPropsToNumber<ArrayElement<T['posts']>[1]>][];
        categories: [string, BigIntPropsToNumber<ArrayElement<T['categories']>[1]>][];
    }
>;

export function fixBigIntContentDataProps<T extends DataPropsWithBigInt>(
    rawData: T,
): FixedBigIntContentDataProps<T> {
    const fixedData: FixedBigIntContentDataProps<T> = {
        ...rawData,
        categories: rawData.categories.map(
            bigIntTupleToNumberTuple,
        ) as FixedBigIntContentDataProps<T>['categories'],
        posts: rawData.posts.map(
            bigIntTupleToNumberTuple,
        ) as FixedBigIntContentDataProps<T>['posts'],
    };

    return fixedData;
}

export function dashboardDataToCanisterContentCreatorData(
    input: ContentCreatorDashboardData,
): nftCandid.RawBulkCreatorData {
    const entries = getObjectTypedKeys(input).reduce((accum, dashboardDataKey) => {
        accum[dashboardDataKey] = Object.entries(input[dashboardDataKey]);
        return accum;
    }, {} as RawContentCreatorDataWithFixedBigIntProps);

    // the number/BigInt types don't match here but the canister handles it fine anyway
    return entries as unknown as nftCandid.RawBulkCreatorData;
}

type BaseRawContentData = {
    [P in keyof RawContentCreatorDataWithFixedBigIntProps]: [string, any][];
};

type BaseOrganizedContentData<T extends BaseRawContentData> = {
    [P in keyof BaseRawContentData]: Record<string, ArrayElement<T[P]>[1]>;
};

export function rawContentCreatorDataToDashboardData<T extends BaseRawContentData>(
    input: T,
): BaseOrganizedContentData<T> {
    return (getObjectTypedKeys(input) as (keyof BaseOrganizedContentData<T>)[]).reduce(
        (accum, creatorDataKey) => {
            accum[creatorDataKey] = input[creatorDataKey].reduce((accum, creatorDataTuple) => {
                accum[creatorDataTuple[0]] = creatorDataTuple[1];
                return accum;
            }, {} as Record<string, any>);
            return accum;
        },
        {} as BaseOrganizedContentData<T>,
    );
}

export type CategoryNoNft = Omit<CreatorCategory, 'nftRequirement'>;
export type ContentCreatorDashboardDataWithNoCategoryRequirement = Overwrite<
    ContentCreatorDashboardData,
    {categories: Record<string, CategoryNoNft>}
>;

/** This feature is unnecessary at the moment so we're hiding it from the creator dashboard. */
export function removeCategoryNftRequirement(
    input: ContentCreatorDashboardData,
): ContentCreatorDashboardDataWithNoCategoryRequirement {
    const strippedCategories: ContentCreatorDashboardDataWithNoCategoryRequirement['categories'] =
        Object.values(input.categories).reduce((accum, category) => {
            const newCategory: CategoryNoNft = {...category};
            delete (newCategory as any).nftRequirement;
            accum[category.id] = newCategory;
            return accum;
        }, {} as ContentCreatorDashboardDataWithNoCategoryRequirement['categories']);
    return {
        ...input,
        categories: strippedCategories,
    };
}

export function addInCategoryNftRequirement(
    input: ContentCreatorDashboardDataWithNoCategoryRequirement,
): ContentCreatorDashboardData {
    const strippedCategories: ContentCreatorDashboardData['categories'] = Object.values(
        input.categories,
    ).reduce((accum, category) => {
        const newCategory: CreatorCategory = {...category, nftRequirement: 0};
        accum[category.id] = newCategory;
        return accum;
    }, {} as ContentCreatorDashboardData['categories']);
    return {
        ...input,
        categories: strippedCategories,
    };
}
