export type UnlockRequirement = {
    required: number;
};

export type UnlockProgress = UnlockRequirement & {
    current: number;
};

export type CreatorId = {
    id?: string;
    name: string;
    avatarUrl?: string | undefined;
};

export enum IdType {
    Content = 'content',
    Category = 'category',
}

export type BaseId<TypeGeneric extends IdType> = {
    label: string;
    id: string;
    type: TypeGeneric;
};

/*
    Here's an example of what the data hierarchy may look like:
    
    CategoryId
        |___ ContentId
        |       |___ content
        |___ ContentId
                |___ content      
    Only in "content" at the bottom is there actually content to show users (besides category
    labels). Also the top ids do not have references to their child ids, but child ids always have
    a reference to their parent. (So "content" at the bottom knows which category it's in.)
 */

/**
 * This is the top of the creator content data hierarchy. Nothing contains categories and categories
 * contain content.
 */
export type CategoryId = BaseId<IdType.Category>;

/** Content instances are within categories. */
export type ContentId = {
    parentId: CategoryId;
} & BaseId<IdType.Content>;

/**
 * All the data for CreatorContent which is not the actual content. Content can be arbitrarily large
 * so we want to load it separately so this metadata can load fast and quick en masse.
 */
export type CreatorContentMetadata = {
    contentId: ContentId;
    unlockRequirement: UnlockRequirement;
    creator: CreatorId;
};

/** Here is the actual content itself, not just a bunch of ids (though it contains those too). */
export type CreatorContent = CreatorContentMetadata & {
    content: string;
};
