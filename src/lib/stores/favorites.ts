import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Book } from '$lib/types';

const STORAGE_KEY = 'supaprobook-favorites';

function isBook(value: unknown): value is Book {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'title' in value &&
		'author' in value &&
		'coverUrl' in value &&
		'description' in value
	);
}

function createFavorites() {
	const { subscribe, set, update } = writable<Book[]>([]);

	if (browser) {
		const rawState = localStorage.getItem(STORAGE_KEY);

		if (rawState) {
			try {
				const parsed = JSON.parse(rawState) as unknown;
				const books = Array.isArray(parsed) ? parsed.filter(isBook) : [];
				set(books);
			} catch {
				set([]);
			}
		}

		subscribe((value) => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		});
	}

	return {
		subscribe,
		toggle(book: Book) {
			update((books) =>
				books.some((savedBook) => savedBook.id === book.id)
					? books.filter((savedBook) => savedBook.id !== book.id)
					: [...books, book]
			);
		}
	};
}

export const favorites = createFavorites();
