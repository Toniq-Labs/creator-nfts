import * as nftCandid from '@frontend/dfx-link/local/canisters/nft/nft.did.js';
import {BigIntPropsToNumber} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {ArrayElement, Overwrite} from 'augment-vir';
import {NftActor} from '../nft-actor';
import {
    fixBigIntContentDataProps,
    rawContentCreatorDataToDashboardData,
} from './creator-content-transforms';
import {RawContentCreatorDataWithFixedBigIntProps} from './creator-content-types';

export type InitialCreatorPostData = BigIntPropsToNumber<nftCandid.RawInitialCreatorPostData>;

type RawUserBrowseContentWithBigIntDataConvertedToNumber = Overwrite<
    RawContentCreatorDataWithFixedBigIntProps,
    {posts: [string, InitialCreatorPostData][]}
>;

export type UserBrowseData = {
    [P in keyof RawUserBrowseContentWithBigIntDataConvertedToNumber]: Record<
        string,
        ArrayElement<RawUserBrowseContentWithBigIntDataConvertedToNumber[P]>[1]
    >;
};

export async function getAllPostDataForUser(nftActor: NftActor): Promise<UserBrowseData> {
    const data = await nftActor.getAllCreatorDataForUser();

    const fixedBigIntProps = fixBigIntContentDataProps(data);

    const finalizedData: UserBrowseData = rawContentCreatorDataToDashboardData(fixedBigIntProps);

    return finalizedData;
}

export async function getIndividualPostContent(
    postId: string,
    nftActor: NftActor,
): Promise<string | undefined> {
    const content = (await nftActor.tryToGetCreatorPostContent(postId))[0];
    return content;
}
