<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { bookshelf } from '$lib/stores/bookshelf';
	import { favorites } from '$lib/stores/favorites';
	import type { Book } from '$lib/types';

	type GoogleBookItem = {
		id: string;
		volumeInfo?: {
			title?: string;
			authors?: string[];
			description?: string;
			imageLinks?: {
				smallThumbnail?: string;
				thumbnail?: string;
			};
		};
	};

	let query = $state('subject:fiction');
	let books = $state<Book[]>([]);
	let isLoading = $state(false);
	let error = $state('');
	let selectedShelfByBook = $state<Record<string, string>>({});
	const SEARCH_STATE_KEY = 'bookly-search-state';

	const quickSearches = [
		{ label: 'Fiction', query: 'subject:fiction' },
		{ label: 'Fantasy', query: 'subject:fantasy' },
		{ label: 'Romance', query: 'subject:romance' },
		{ label: 'Mystery', query: 'subject:mystery' }
	] as const;

	function mapBook(item: GoogleBookItem): Book {
		const info = item.volumeInfo;

		return {
			id: item.id,
			title: info?.title ?? 'Untitled',
			author: info?.authors?.[0] ?? 'Unknown author',
			coverUrl: info?.imageLinks?.thumbnail ?? info?.imageLinks?.smallThumbnail ?? null,
			description: info?.description ?? ''
		};
	}

	async function searchBooks() {
		isLoading = true;
		error = '';

		try {
			const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);

			if (!response.ok) {
				throw new Error(response.status === 429 ? 'Rate limited' : 'Search failed');
			}

			const data = await response.json();
			books = (data.items ?? []).map(mapBook);
			sessionStorage.setItem(
				SEARCH_STATE_KEY,
				JSON.stringify({
					query,
					books
				})
			);
		} catch {
			error = 'Could not load books right now. If this is on Vercel, the Google Books request may be rate-limited.';
			books = [];
		} finally {
			isLoading = false;
		}
	}

	function runQuickSearch(nextQuery: string) {
		query = nextQuery;
		searchBooks();
	}

	function selectShelf(bookId: string, shelfId: string) {
		selectedShelfByBook = {
			...selectedShelfByBook,
			[bookId]: shelfId
		};
	}

	function getSelectedShelf(bookId: string) {
		return selectedShelfByBook[bookId] ?? $bookshelf.shelves[0]?.id ?? '';
	}

	function addBookToSelectedShelf(book: Book) {
		const shelfId = getSelectedShelf(book.id);

		if (!shelfId) {
			return;
		}

		bookshelf.addBookToShelf(book, shelfId);
	}

	function selectedShelfContainsBook(bookId: string) {
		const shelfId = getSelectedShelf(bookId);

		if (!shelfId) {
			return false;
		}

		return $bookshelf.books.some(
			(book) => book.id === bookId && book.shelfIds.includes(shelfId)
		);
	}

	onMount(() => {
		const savedSearch = sessionStorage.getItem(SEARCH_STATE_KEY);

		if (savedSearch) {
			try {
				const parsed = JSON.parse(savedSearch) as { query?: string; books?: Book[] };

				if (parsed.query && Array.isArray(parsed.books) && parsed.books.length > 0) {
					query = parsed.query;
					books = parsed.books;
					isLoading = false;
					return;
				}
			} catch {
				sessionStorage.removeItem(SEARCH_STATE_KEY);
			}
		}

		searchBooks();
	});
</script>

<svelte:head>
	<title>Bookly</title>
</svelte:head>

<div class="min-h-screen bg-stone-100 text-stone-900">
	<div class="mx-auto max-w-6xl px-6 py-10">
		<div class="mb-8">
			<p class="text-brand mb-2 text-sm font-semibold uppercase tracking-[0.25em]">
				Book Discovery
			</p>
			<h1 class="text-4xl font-bold tracking-tight">Find books and explore details</h1>
		</div>

		<form class="mb-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200" onsubmit={(event) => {
			event.preventDefault();
			searchBooks();
		}}>
			<label class="mb-2 block text-sm font-medium" for="search">Search by title or author</label>
			<div class="flex flex-col gap-3 md:flex-row">
				<input
					id="search"
					bind:value={query}
					class="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-brand"
					placeholder="Try subject:fiction or your favorite author"
				/>
				<button
					type="submit"
					class="bg-brand hover:bg-brand-deep rounded-2xl px-5 py-3 font-semibold text-white transition"
				>
					Search
				</button>
			</div>

			<div class="mt-4 flex flex-wrap gap-2">
				{#each quickSearches as item (item.query)}
					<button
						type="button"
						class="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-brand hover:text-brand"
						onclick={() => runQuickSearch(item.query)}
					>
						{item.label}
					</button>
				{/each}
			</div>
		</form>

		{#if isLoading}
			<p class="text-sm text-stone-600">Loading books...</p>
		{:else if error}
			<p class="text-sm text-red-700">{error}</p>
		{:else}
			<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each books as book (book.id)}
					<div class="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
						<div class="relative flex h-56 items-center justify-center bg-stone-100 p-4">
							<button
								type="button"
								aria-label={`Favorite ${book.title}`}
								class={`absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 transition ${
									$favorites.some((favoriteBook) => favoriteBook.id === book.id)
										? 'bg-favorite text-white ring-favorite'
										: 'text-favorite bg-white/95 ring-stone-200 hover:bg-favorite-soft'
								}`}
								onclick={() => favorites.toggle(book)}
							>
								<span class="text-lg leading-none">
									{$favorites.some((favoriteBook) => favoriteBook.id === book.id) ? '♥' : '♡'}
								</span>
							</button>

							<a
								href={resolve('/book/[id]', { id: book.id })}
								class="flex h-full w-full items-center justify-center"
								aria-label={`See details for ${book.title}`}
							>
								{#if book.coverUrl}
									<img
										class="max-h-full max-w-full object-contain shadow-sm"
										src={book.coverUrl}
										alt={book.title}
									/>
								{:else}
									<div class="flex h-full items-center justify-center px-6 text-center text-sm text-stone-500">
										No cover available
									</div>
								{/if}
							</a>
						</div>

						<div class="flex flex-1 flex-col p-4">
							<div>
								<h2 class="line-clamp-2 text-lg font-semibold">{book.title}</h2>
								<p class="text-sm text-stone-600">{book.author}</p>
							</div>

							<div class="mt-auto space-y-3 pt-4">
								{#if $bookshelf.shelves.length > 0}
									<div class="space-y-2">
									<select
										class="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-2 text-sm outline-none transition focus:border-brand"
										value={getSelectedShelf(book.id)}
										onchange={(event) =>
											selectShelf(book.id, (event.currentTarget as HTMLSelectElement).value)}
									>
										{#each $bookshelf.shelves as shelf (shelf.id)}
											<option value={shelf.id}>{shelf.name}</option>
										{/each}
									</select>

									<button
										type="button"
										class={`w-full rounded-2xl border px-4 py-2 text-sm font-medium transition ${
											selectedShelfContainsBook(book.id)
												? 'border-brand bg-brand-soft text-brand-deep'
												: 'border-stone-300 hover:border-brand hover:text-brand'
										}`}
										onclick={() => addBookToSelectedShelf(book)}
									>
										{selectedShelfContainsBook(book.id) ? 'Added to shelf' : 'Add to shelf'}
									</button>
									</div>
								{:else}
									<a
										href={resolve('/my-books')}
										class="block w-full rounded-2xl border border-dashed border-stone-300 px-4 py-2 text-center text-sm font-medium transition hover:border-brand hover:text-brand"
									>
										Create a shelf first
									</a>
								{/if}

								<a
									href={resolve('/book/[id]', { id: book.id })}
									class="block w-full rounded-2xl border border-stone-300 px-4 py-2 text-center text-sm font-medium transition hover:border-brand hover:text-brand"
								>
									See more details
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
