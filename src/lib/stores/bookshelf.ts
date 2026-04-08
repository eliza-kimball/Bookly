import { writable } from 'svelte/store';
import type { Book } from '$lib/types';

function createBookshelf() {
	const { subscribe, update } = writable<Book[]>([]);

	return {
		subscribe,
		toggle(book: Book) {
			update((books) => {
				const exists = books.some((savedBook) => savedBook.id === book.id);
				return exists
					? books.filter((savedBook) => savedBook.id !== book.id)
					: [...books, book];
			});
		}
	};
}

export const bookshelf = createBookshelf();
