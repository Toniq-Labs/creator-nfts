import {CategoryId, CreatorContent, CreatorId, IdType} from '@frontend/src/data/creator-content';
import {getObjectTypedKeys} from 'augment-vir';

export function getAllHardcodedCreatorContent(): CreatorContent[] {
    const creatorContent = Object.values(hardcodedCreatorContent.categories).reduce(
        (accum, category) => {
            const contents = Object.values(category.contents);

            return accum.concat(...contents);
        },
        [] as CreatorContent[],
    );

    return creatorContent;
}

function createCategoryIds<GenericInput extends {[label: string]: string}>(
    ids: GenericInput,
): Record<keyof GenericInput, CategoryId> {
    return getObjectTypedKeys(ids).reduce((accum, currentLabel) => {
        const currentId = ids[currentLabel];
        if (typeof currentLabel !== 'string') {
            throw new Error(`All category ids must be strings. "${currentLabel}" is not.`);
        }
        if (!currentId) {
            throw new Error(`Missing id for category label "${currentLabel}"`);
        }
        const categoryId: CategoryId = {
            id: currentId,
            label: currentLabel,
            type: IdType.Category,
        };
        accum[currentLabel as keyof GenericInput] = categoryId;
        return accum;
    }, {} as Record<keyof GenericInput, CategoryId>);
}

const hardcodedCategoryIdsByLabel = createCategoryIds({
    'Category 1': 'abc1',
    'Category 2': 'abc2',
});

// this is a separate array so that ordering can be specified.
export const hardcodedCategories: CategoryId[] = [
    hardcodedCategoryIdsByLabel['Category 1'],
    hardcodedCategoryIdsByLabel['Category 2'],
];

type HardcodedCategoryContents = {
    id: CategoryId;
    contents: {
        [contentId: string]: CreatorContent;
    };
};

export type HardcodedCategories = {
    categories: {
        [categoryId: string]: HardcodedCategoryContents;
    };
};

type CreateHardcodedCreatorCreatorContentMap = Map<
    CategoryId,
    {
        [contentId: string]: Omit<CreatorContent, 'contentId'> & {contentLabel: string};
    }
>;

function createHardcodedCreatorContent(
    inputMap: CreateHardcodedCreatorCreatorContentMap,
): HardcodedCategories {
    return Array.from(inputMap.keys()).reduce(
        (accum, categoryIdObjectKey) => {
            const mapValue = inputMap.get(categoryIdObjectKey);
            if (!mapValue) {
                throw new Error(
                    `Category key for category id "${categoryIdObjectKey.id}" contained no contents.`,
                );
            }

            const inputContents: {
                [contentId: string]: CreatorContent;
            } = Object.keys(mapValue).reduce((accum, currentContentIdString) => {
                const inputContent = mapValue[currentContentIdString];

                if (!inputContent) {
                    throw new Error(`Missing content for content key "${currentContentIdString}"`);
                }

                accum[currentContentIdString] = {
                    ...inputContent,
                    contentId: {
                        label: inputContent.contentLabel,
                        id: currentContentIdString,
                        type: IdType.Content,
                        parentId: categoryIdObjectKey,
                    },
                };
                return accum;
            }, {} as Record<string, CreatorContent>);

            const categoryContents: HardcodedCategoryContents = {
                id: categoryIdObjectKey,
                contents: inputContents,
            };
            accum.categories[categoryIdObjectKey.id] = categoryContents;
            return accum;
        },
        {categories: {}} as HardcodedCategories,
    );
}

// TODO: fill in creator id
const hardcodedCreatorId: CreatorId = {
    name: 'Toniq Labs Creator',
    avatarUrl: 'https://unavatar.io/toniqlabs',
    id: 'abcd1234',
};

export const hardcodedCreatorContent = createHardcodedCreatorContent(
    new Map<
        CategoryId,
        {
            [contentId: string]: Omit<CreatorContent, 'contentId'> & {contentLabel: string};
        }
    >([
        [
            hardcodedCategoryIdsByLabel['Category 1'],
            {
                abc11: {
                    contentLabel: 'Welcome!',
                    content: `Welcome to Creator NFTs!`,
                    creator: hardcodedCreatorId,
                    unlockRequirement: {
                        required: 0,
                    },
                },
                abc13: {
                    contentLabel: 'Category 1 Entry 2 placeholder Title',
                    content: `Category 1 entry 2 placeholder content!`,
                    creator: hardcodedCreatorId,
                    unlockRequirement: {
                        required: 10,
                    },
                },
            },
        ],
        [
            hardcodedCategoryIdsByLabel['Category 2'],
            {
                abc21: {
                    contentLabel: 'Category 2 Entry 1 placeholder Title',
                    content: `Category 2 entry 1 placeholder content!`,
                    creator: hardcodedCreatorId,
                    unlockRequirement: {
                        required: 1,
                    },
                },
                abc22: {
                    contentLabel: 'Category 2 Entry 2 placeholder Title',
                    content: `Category 2 entry 2 placeholder content!`,
                    creator: hardcodedCreatorId,
                    unlockRequirement: {
                        required: 20,
                    },
                },
            },
        ],
    ]),
);
