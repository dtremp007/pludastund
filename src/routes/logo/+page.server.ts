import { db } from '$lib/server/db';
import { logoVariations } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const savedVariations = await db.select().from(logoVariations).orderBy(logoVariations.createdAt);
    return { savedVariations };
}

export const actions = {
	save: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const colors = formData.get('colors') as string;

        console.log('name:', name);
        console.log('colors:', colors);

		await db.insert(logoVariations).values({
			name,
			colors,
			likes: 0
		});
	},
    like: async ({ request }) => {
		const formData = await request.formData();
        const id = formData.get('id') as string;

        await db.update(logoVariations)
            .set({ likes: sql`${logoVariations.likes} + 1` })
            .where(eq(logoVariations.id, +id));
    }
} satisfies Actions;
