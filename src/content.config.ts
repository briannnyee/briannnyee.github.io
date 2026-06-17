import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const tagSchema = z.object({
  label: z.string(),
  color: z.enum(['yellow', 'cyan', 'magenta', 'green', 'red']),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title:    z.string(),
    date:     z.string(),
    readtime: z.string(),
    featured: z.boolean().default(false),
    cover:    z.string().optional(),
    coverPlaceholder: z.boolean().default(false),
    tags:     z.array(tagSchema),
    excerpt:  z.string(),
  }),
});

export const collections = { blog };
