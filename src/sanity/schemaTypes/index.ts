import { type SchemaTypeDefinition } from 'sanity';
import { projectType } from './projectType';
import { galleryBlockType } from './galleryBlockType';
import { siteSettingsType } from './siteSettingsType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, galleryBlockType, siteSettingsType],
};
