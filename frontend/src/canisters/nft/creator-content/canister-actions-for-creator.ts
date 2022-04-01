import {withTimeout} from '@frontend/src/augments/promise';
import {
    dashboardDataToCanisterContentCreatorData,
    fixBigIntContentDataProps,
    rawContentCreatorDataToDashboardData,
} from '@frontend/src/canisters/nft/creator-content/creator-content-transforms';
import {
    ContentCreatorDashboardData,
    emptyData,
    RawContentCreatorDataWithFixedBigIntProps,
} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {NftActor} from '@frontend/src/canisters/nft/nft-actor';

async function getCreatorDashBoardDataWithBigIntPropsConvertedToNumbers(
    nftActor: NftActor,
): Promise<RawContentCreatorDataWithFixedBigIntProps> {
    const serverData = await nftActor.getAllCreatorDataForCreator();

    const fixedBigIntProps: RawContentCreatorDataWithFixedBigIntProps =
        fixBigIntContentDataProps(serverData);
    return fixedBigIntProps;
}

export async function getCreatorDashboardData(
    nftActor: NftActor,
): Promise<ContentCreatorDashboardData | undefined> {
    try {
        const nftCreatorData: RawContentCreatorDataWithFixedBigIntProps =
            await getCreatorDashBoardDataWithBigIntPropsConvertedToNumbers(nftActor);

        const contentCreatorDashboardData: ContentCreatorDashboardData =
            rawContentCreatorDataToDashboardData(nftCreatorData);

        return contentCreatorDashboardData;
    } catch (error) {
        console.error(`Failed to load creator data.`);
        // return empty data so we can at least fix the broken data
        return emptyData;
    }
}

export async function saveCreatorDashboardData(
    nftActor: NftActor,
    data: ContentCreatorDashboardData,
): Promise<boolean> {
    try {
        const dataToSave = dashboardDataToCanisterContentCreatorData(data);
        // for debugging
        console.info({dataToSave});

        return await withTimeout(10000, nftActor.saveAllCreatorData(dataToSave));
    } catch (error) {
        console.error(`Failed to save creator data.`);
        throw error;
    }
}
