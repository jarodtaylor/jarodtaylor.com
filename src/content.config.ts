import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pillarIds = ['leading', 'design-engineering', 'developer-experience', 'learning-ai'] as const;

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: reference('pillars'),
    draft: z.boolean().default(false),
  }),
});

const pillars = defineCollection({
  loader: file('./src/content/data/pillars.json'),
  schema: z.object({
    id: z.enum(pillarIds),
    title: z.string(),
    status: z.enum(['experience', 'learning']),
    description: z.string(),
  }),
});

const work = defineCollection({
  loader: file('./src/content/data/work.json'),
  schema: z.object({
    title: z.string(),
    org: z.string(),
    /** Headline number, e.g. "29 → 95 Lighthouse performance". Featured entries only. */
    metric: z.string().optional(),
    detail: z.string(),
    featured: z.boolean(),
  }),
});

const workbench = defineCollection({
  loader: file('./src/content/data/workbench.json'),
  schema: z.object({
    name: z.string(),
    url: z.url(),
    status: z.string(),
    description: z.string(),
  }),
});

const career = defineCollection({
  loader: file('./src/content/data/career.json'),
  schema: z.object({
    role: z.string(),
    company: z.string(),
    start: z.number().int(),
    end: z.number().int(),
  }),
});

const testimonials = defineCollection({
  loader: file('./src/content/data/testimonials.json'),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    title: z.string(),
    company: z.string(),
  }),
});

export const collections = { posts, pillars, work, workbench, career, testimonials };
