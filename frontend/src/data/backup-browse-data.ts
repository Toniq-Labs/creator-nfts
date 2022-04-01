import {UserBrowseData} from '@frontend/src/canisters/nft/creator-content/canister-actions-for-user';

export const backupUserBrowseData: UserBrowseData = {
    categories: {
        abc1: {
            categoryLabel: 'Dummy Category 1',
            id: 'abc1',
            nftRequirement: 0,
            order: 0,
            postIds: [
                'abc11',
                'abc12',
            ],
        },
        abc2: {
            categoryLabel: 'Dummy Category 2',
            id: 'abc2',
            nftRequirement: 0,
            order: 0,
            postIds: [
                'abc21',
                'abc22',
            ],
        },
    },
    creators: {
        abcd1234: {
            avatarUrl: 'https://unavatar.io/toniqlabs',
            id: 'abcd1234',
            name: 'Toniq Labs',
        },
    },
    posts: {
        abc11: {
            categoryId: 'abc1',
            creatorId: 'abcd1234',
            id: 'abc11',
            nftRequirement: 0,
            postLabel: "Welcome! This is just dummy data! There's no post to view!",
            timestamp: Date.now(),
        },
        abc12: {
            categoryId: 'abc1',
            creatorId: 'abcd1234',
            id: 'abc11',
            nftRequirement: 10,
            postLabel: 'Follow the README for setup instructions!',
            timestamp: Date.now(),
        },
        abc21: {
            categoryId: 'abc1',
            creatorId: 'abcd1234',
            id: 'abc11',
            nftRequirement: 0,
            postLabel: 'Category 2 post 1 title',
            timestamp: Date.now(),
        },
        abc22: {
            categoryId: 'abc1',
            creatorId: 'abcd1234',
            id: 'abc11',
            nftRequirement: 20,
            postLabel: 'Category 2 post 2 title',
            timestamp: Date.now(),
        },
    },
};
