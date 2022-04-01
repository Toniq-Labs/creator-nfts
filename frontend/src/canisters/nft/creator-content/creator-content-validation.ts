import {
    ContentCreatorDashboardData,
    Creator,
    CreatorCategory,
    CreatorPost,
} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {
    getObjectTypedKeys,
    getObjectTypedValues,
    isObject,
    typedHasOwnProperties,
} from 'augment-vir';

type BasicCreatorContentStub = Record<
    keyof ContentCreatorDashboardData,
    Record<PropertyKey, unknown>
>;

const creatorContentDataStub: BasicCreatorContentStub = {
    categories: {},
    posts: {},
    creators: {},
};

function hasBasicCreatorContentStubKeys(input: object): input is BasicCreatorContentStub {
    return typedHasOwnProperties(getObjectTypedKeys(creatorContentDataStub), input);
}

const creatorStub: Creator = {
    avatarUrl: '',
    id: '',
    name: '',
};

function hasCreatorProps(input: object): input is Creator {
    if (!typedHasOwnProperties(getObjectTypedKeys(creatorStub), input)) {
        return false;
    }

    return getObjectTypedKeys(input).every((key) => {
        return typeof input[key] === typeof creatorStub[key];
    });
}

const categoryStub: CreatorCategory = {
    categoryLabel: '',
    id: '',
    nftRequirement: 0,
    order: 0,
    postIds: [''],
};

function hasCategoryProps(input: object): input is CreatorCategory {
    if (!typedHasOwnProperties(getObjectTypedKeys(categoryStub), input)) {
        return false;
    }

    return getObjectTypedKeys(input).every((key) => {
        const inputValue = input[key];
        const stubValue = categoryStub[key];
        if (typeof inputValue !== typeof stubValue) {
            return false;
        }
        if (Array.isArray(stubValue)) {
            if (!Array.isArray(inputValue)) {
                return false;
            }
            return inputValue.every((inputEntry) => typeof inputEntry === typeof stubValue[0]);
        } else {
            return true;
        }
    });
}

const creatorPostStub: CreatorPost = {
    categoryId: '',
    content: '',
    creatorId: '',
    id: '',
    nftRequirement: 0,
    postLabel: '',
    timestamp: 0,
};

function hasCreatorPostProps(input: object): input is CreatorPost {
    if (!typedHasOwnProperties(getObjectTypedKeys(creatorPostStub), input)) {
        return false;
    }

    return getObjectTypedKeys(input).every((key) => {
        return typeof input[key] === typeof creatorPostStub[key];
    });
}

export function isValidDashboardData(input: unknown): input is ContentCreatorDashboardData {
    try {
        assertValidDashboardData(input);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export function assertValidDashboardData(
    input: unknown,
): asserts input is ContentCreatorDashboardData {
    if (!input || typeof input !== 'object') {
        throw new Error('Input is not a defined object');
    }
    if (!hasBasicCreatorContentStubKeys(input)) {
        throw new Error(
            `Input does not have the correct properties of ${Object.keys(
                creatorContentDataStub,
            ).join(', ')}`,
        );
    }

    // validate creators
    getObjectTypedKeys(input.creators).forEach((key) => {
        if ((typeof key !== 'string' && typeof key !== 'number') || key === '') {
            throw new Error(`creator key is not valid: "${String(key)}".`);
        }

        const creator = input.creators[key];
        if (!isObject(creator)) {
            console.error({creator});
            throw new Error(`Creator at key "${key}" is not an object.`);
        }
        if (!hasCreatorProps(creator)) {
            console.error({creator});
            throw new Error(
                `Creator at key "${key}" is missing at least one of the proper creator properties: ${Object.keys(
                    creatorStub,
                ).join(', ')}.`,
            );
        }

        if (!creator.id) {
            console.error({creator});
            throw new Error(`Creator at key "${key}" is missing an id.`);
        }
        if (creator.id !== key) {
            console.error({creator});
            throw new Error(`Id of creator at key "${key}" does not match that key.`);
        }
        if (!creator.name) {
            console.error({creator});
            throw new Error(`Creator at key "${key}" is missing a name.`);
        }
    });

    // validate categories
    getObjectTypedKeys(input.categories).forEach((key) => {
        if ((typeof key !== 'string' && typeof key !== 'number') || key === '') {
            throw new Error(`Category key is not valid: "${String(key)}".`);
        }

        const category = input.categories[key];
        if (!isObject(category)) {
            console.error({category});
            throw new Error(`Category at key "${key}" is not an object.`);
        }
        if (!hasCategoryProps(category)) {
            console.error({category});
            throw new Error(
                `Category at key "${key}" is missing at least one of the proper category properties: ${Object.keys(
                    categoryStub,
                ).join(', ')}.`,
            );
        }

        if (!category.id) {
            console.error({category});
            throw new Error(`Category at key "${key}" is missing an id.`);
        }
        if (category.id !== key) {
            console.error({category});
            throw new Error(`Id of category at key "${key}" does not match that key.`);
        }
        if (!category.categoryLabel) {
            console.error({category});
            throw new Error(`Category at key "${key}" is missing a categoryLabel.`);
        }
        category.postIds.forEach((postId) => {
            if (!postId) {
                console.error({category});
                throw new Error(`Post id of "${postId}" is invalid.`);
            }
            if (!input.posts[postId]) {
                console.error({category});
                throw new Error(`Post with id "${postId}" does not exist in the "posts" property.`);
            }
        });

        const deDupedPostIds = new Set(category.postIds);
        if (deDupedPostIds.size !== category.postIds.length) {
            throw new Error(`Category "${category.id}" has duplicates in its postIds array.`);
        }
    });

    function creatorPostError(creatorPost: CreatorPost, key: PropertyKey, message: string): void {
        console.error({creatorPost});
        throw new Error(`Post at key "${String(key)}" ${message}.`);
    }

    // validate posts
    getObjectTypedKeys(input.posts).forEach((key) => {
        if ((typeof key !== 'string' && typeof key !== 'number') || key === '') {
            throw new Error(`Post key is not valid: "${String(key)}".`);
        }

        const creatorPost = input.posts[key];
        if (!isObject(creatorPost)) {
            console.error({creatorPost});
            throw new Error(`Post at key "${key}" is not an object.`);
        }
        if (!hasCreatorPostProps(creatorPost)) {
            console.error({creatorPost});
            throw new Error(
                `Post at key "${key}" is missing at least one of the proper creatorPost properties: ${Object.keys(
                    creatorPostStub,
                ).join(', ')}.`,
            );
        }

        if (!creatorPost.timestamp) {
            creatorPostError(creatorPost, key, 'is missing a valid timestamp.');
        }
        if (creatorPost.timestamp < 1000000000000) {
            creatorPostError(
                creatorPost,
                key,
                "has a small timestamp. Make sure you're using milliseconds.",
            );
        }
        if (creatorPost.timestamp > 999999999999999) {
            creatorPostError(
                creatorPost,
                key,
                "has a huge timestamp. Make sure you're using milliseconds.",
            );
        }
        if (!creatorPost.id) {
            creatorPostError(creatorPost, key, 'is missing an id.');
        }
        if (creatorPost.id !== key) {
            creatorPostError(creatorPost, key, 'does not have its id identical to that key.');
        }
        if (!creatorPost.categoryId) {
            creatorPostError(creatorPost, key, 'is missing a category id.');
        }
        if (!creatorPost.creatorId) {
            creatorPostError(creatorPost, key, 'is missing a creator id.');
        }
        if (!creatorPost.content) {
            creatorPostError(creatorPost, key, 'is missing its content.');
        }
        if (!creatorPost.postLabel) {
            creatorPostError(creatorPost, key, 'is missing a postLabel (title).');
        }

        const postCategory = input.categories[creatorPost.categoryId];

        if (!postCategory) {
            console.error({creatorPost});
            throw new Error(
                `Category of id "${creatorPost.categoryId}" from post of id "${creatorPost.id}" does not exist.`,
            );
        }
        if (!isObject(postCategory) || !hasCategoryProps(postCategory)) {
            console.error({creatorPost});
            throw new Error(
                `Category of id "${creatorPost.categoryId}" from post of id "${creatorPost.id}" is not valid.`,
            );
        }

        const isInCategoryPostIds: boolean = postCategory.postIds.includes(creatorPost.id);

        if (!isInCategoryPostIds) {
            console.error({creatorPost});
            throw new Error(
                `Post of id "${creatorPost.id}" is not saved into the post ids of its category of id "${creatorPost.categoryId}"`,
            );
        }

        getObjectTypedValues(input.categories).forEach((category) => {
            // this is already getting validated elsewhere, we're just doing it here for type safety
            if (!isObject(category) || !hasCategoryProps(category)) {
                return;
            }
            // ignore a posts's intended category
            if (category.id === creatorPost.categoryId) {
                return;
            }
            if (category.postIds.includes(creatorPost.id)) {
                throw new Error(
                    `Category of id "${category.id}" contains post id "${creatorPost.id}" but this category is not the posts's intended category of "${creatorPost.categoryId}"`,
                );
            }
        });

        const postCreator = input.creators[creatorPost.creatorId];

        if (!postCreator) {
            console.error({creatorPost});
            throw new Error(
                `Creator of id "${creatorPost.creatorId}" from post of id "${creatorPost.id}" does not exist.`,
            );
        }
    });
}
