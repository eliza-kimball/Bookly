export type Book = {
	id: string;
	title: string;
	author: string;
	coverUrl: string | null;
	description: string;
};

export type Shelf = {
	id: string;
	name: string;
};

export type SavedBook = Book & {
	shelfIds: string[];
};

export type LibraryState = {
	shelves: Shelf[];
	books: SavedBook[];
};
