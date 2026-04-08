<script lang="ts">
	import { onMount } from 'svelte';
	import { bookshelf } from '$lib/stores/bookshelf';
	import type { Book } from '$lib/types';

	type OpenLibraryDoc = {
		key: string;
		title: string;
		author_name?: string[];
		cover_i?: number;
	};

	let query = $state('fiction');
	let books = $state<Book[]>([]);
	let isLoading = $state(false);
	let error = $state('');
	let favoriteIds = $state<string[]>([]);

	function mapBook(doc: OpenLibraryDoc): Book {
		return {
			id: doc.key,
			title: doc.title,
			author: doc.author_name?.[0] ?? 'Unknown author',
			coverUrl: doc.cover_i
				? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
				: null,
			description: ''
		};
	}

	async function searchBooks() {
		isLoading = true;
		error = '';

		try {
			const response = await fetch(
				`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
			);

			if (!response.ok) {
				throw new Error('Search failed');
			}

			const data = await response.json();
			books = data.docs.slice(0, 12).map(mapBook);
		} catch {
			error = 'Could not load books right now.';
			books = [];
		} finally {
			isLoading = false;
		}
	}

	function toggleFavorite(bookId: string) {
		favoriteIds = favoriteIds.includes(bookId)
			? favoriteIds.filter((id) => id !== bookId)
			: [...favoriteIds, bookId];
	}

	onMount(searchBooks);
</script>

<svelte:head>
	<title>SupaProBook</title>
</svelte:head>

<div class="min-h-screen bg-stone-100 text-stone-900">
	<div class="mx-auto max-w-6xl px-6 py-10">
		<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
			<div>
				<p class="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
					Book Discovery
				</p>
				<h1 class="text-4xl font-bold tracking-tight">Find books and build your shelf</h1>
			</div>

			<div class="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-stone-200">
				<p class="text-xs uppercase tracking-[0.2em] text-stone-500">Saved so far</p>
				<p class="text-3xl font-bold">{$bookshelf.length}</p>
			</div>
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
					class="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-600"
					placeholder="Try The Hobbit or Jane Austen"
				/>
				<button
					type="submit"
					class="rounded-2xl bg-amber-700 px-5 py-3 font-semibold text-white transition hover:bg-amber-800"
				>
					Search
				</button>
			</div>
		</form>

		{#if isLoading}
			<p class="text-sm text-stone-600">Loading books...</p>
		{:else if error}
			<p class="text-sm text-red-700">{error}</p>
		{:else}
			<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each books as book (book.id)}
					<div class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
						<div class="relative flex h-56 items-center justify-center bg-stone-100 p-4">
							<button
								type="button"
								aria-label={`Favorite ${book.title}`}
								class={`absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 transition ${
									favoriteIds.includes(book.id)
										? 'bg-amber-700 text-white ring-amber-700'
										: 'bg-white/95 text-amber-700 ring-stone-200 hover:bg-amber-50'
								}`}
								onclick={() => toggleFavorite(book.id)}
							>
								<span class="text-lg leading-none">
									{favoriteIds.includes(book.id) ? '♥' : '♡'}
								</span>
							</button>

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
						</div>

						<div class="space-y-3 p-4">
							<div>
								<h2 class="line-clamp-2 text-lg font-semibold">{book.title}</h2>
								<p class="text-sm text-stone-600">{book.author}</p>
							</div>

							<button
								class="w-full rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-amber-700 hover:text-amber-700"
								onclick={() => bookshelf.toggle(book)}
							>
								{$bookshelf.some((savedBook) => savedBook.id === book.id) ? 'Remove from shelf' : 'Save to shelf'}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
