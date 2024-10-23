import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const logoVariations = sqliteTable('logo_variations', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    colors: text('colors').notNull(), // JSON string of colors
    likes: integer('likes').notNull().default(0),
    createdAt: text('timestamp')
        .notNull()
        .default(sql`(current_timestamp)`),
  });

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
