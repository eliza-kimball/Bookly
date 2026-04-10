import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Book, LibraryState } from '$lib/types';

const STORAGE_KEY = 'supaprobook-library';

const initialState: LibraryState = {
	shelves: [],
	books: []
};

function createBookshelf() {
	const { subscribe, set, update } = writable<LibraryState>(initialState);

	if (browser) {
		const rawState = localStorage.getItem(STORAGE_KEY);

		if (rawState) {
			try {
				set(JSON.parse(rawState) as LibraryState);
			} catch {
				set(initialState);
			}
		}

		subscribe((value) => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		});
	}

	return {
		subscribe,
		createShelf(name: string) {
			const trimmedName = name.trim();

			if (!trimmedName) {
				return;
			}

			update((state) => {
				const exists = state.shelves.some(
					(shelf) => shelf.name.toLowerCase() === trimmedName.toLowerCase()
				);

				if (exists) {
					return state;
				}

				return {
					...state,
					shelves: [
						...state.shelves,
						{ id: crypto.randomUUID(), name: trimmedName }
					]
				};
			});
		},
		deleteShelf(shelfId: string) {
			update((state) => {
				const books = state.books
					.map((book) => ({
						...book,
						shelfIds: book.shelfIds.filter((id) => id !== shelfId)
					}))
					.filter((book) => book.shelfIds.length > 0);

				return {
					shelves: state.shelves.filter((shelf) => shelf.id !== shelfId),
					books
				};
			});
		},
		addBookToShelf(book: Book, shelfId: string) {
			update((state) => {
				if (!state.shelves.some((shelf) => shelf.id === shelfId)) {
					return state;
				}

				const existingBook = state.books.find((savedBook) => savedBook.id === book.id);

				if (!existingBook) {
					return {
						...state,
						books: [...state.books, { ...book, shelfIds: [shelfId] }]
					};
				}

				if (existingBook.shelfIds.includes(shelfId)) {
					return state;
				}

				return {
					...state,
					books: state.books.map((savedBook) =>
						savedBook.id === book.id
							? { ...savedBook, shelfIds: [...savedBook.shelfIds, shelfId] }
							: savedBook
					)
				};
			});
		},
		removeBookFromShelf(bookId: string, shelfId: string) {
			update((state) => {
				const books = state.books
					.map((book) =>
						book.id === bookId
							? { ...book, shelfIds: book.shelfIds.filter((id) => id !== shelfId) }
							: book
					)
					.filter((book) => book.shelfIds.length > 0);

				return { ...state, books };
			});
		}
	};
}

export const bookshelf = createBookshelf();
