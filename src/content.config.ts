import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            description: z.string(),
            date: z.coerce.date(),
            technologies: z.array(z.string()).default([]),
            image: z.object({
                src: image(),
                alt: z.string(),
            }),
            repository: z.url().optional(),
            draft: z.boolean().default(true),
        }),
});

export const collections = { works };
