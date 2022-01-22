import {
    CategoryId,
    ContentId,
    CreatorContent,
    CreatorContentMetadata,
} from '@frontend/src/data/creator-content';
import {
    hardcodedCategories,
    hardcodedCreatorContent,
} from '@frontend/src/data/hardcoded-creator-content';

/**
 * This canister doesn't actually exist. This code is collected here though to easily facilitate
 * creating a separate canister.
 */

export async function getCurrentUserContentCategories(): Promise<CategoryId[] | undefined> {
    return hardcodedCategories;
}

export async function getCategoryContents(
    categoryId: CategoryId,
): Promise<Record<string, CreatorContentMetadata> | undefined> {
    const categoryContents = hardcodedCreatorContent.categories[categoryId.id]?.contents;
    const contentTracking: Record<string, CreatorContentMetadata> | undefined = categoryContents
        ? Object.values(categoryContents).reduce((accum, creatorContent) => {
              accum[creatorContent.contentId.id] = creatorContent;
              return accum;
          }, {} as Record<string, CreatorContentMetadata>)
        : undefined;

    return contentTracking;
}

export async function getContent(contentId: ContentId): Promise<CreatorContent | undefined> {
    return hardcodedCreatorContent.categories[contentId.parentId.id]?.contents[contentId.id];
}
