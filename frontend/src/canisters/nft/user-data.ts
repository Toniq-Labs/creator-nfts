import {NftActor} from './nft-actor';

export async function getUserNftIds(nftActor: NftActor): Promise<number[]> {
    try {
        const nftIds = await nftActor.getUserNFTIndexes();

        return nftIds;
    } catch (error) {
        console.error('Failed to get User NFT ids.');
        console.error(error);
        return [];
    }
}

export async function isContentCreator(nftActor: NftActor): Promise<boolean> {
    try {
        return nftActor.isContentCreator();
    } catch (error) {
        console.error(error);
        return false;
    }
}
