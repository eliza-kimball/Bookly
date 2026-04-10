<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
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
	let favoriteIds = $state<string[]>([]);

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
				throw new Error('Search failed');
			}

			const data = await response.json();
			books = (data.items ?? []).map(mapBook);
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

	function runQuickSearch(nextQuery: string) {
		query = nextQuery;
		searchBooks();
	}

	onMount(searchBooks);
</script>

<svelte:head>
	<title>SupaProBook</title>
</svelte:head>

<div class="min-h-screen bg-stone-100 text-stone-900">
	<div class="mx-auto max-w-6xl px-6 py-10">
		<div class="mb-8">
			<p class="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
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
					class="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-600"
					placeholder="Try subject:fiction or your favorite author"
				/>
				<button
					type="submit"
					class="rounded-2xl bg-amber-700 px-5 py-3 font-semibold text-white transition hover:bg-amber-800"
				>
					Search
				</button>
			</div>

			<div class="mt-4 flex flex-wrap gap-2">
				{#each quickSearches as item (item.query)}
					<button
						type="button"
						class="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-amber-700 hover:text-amber-700"
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

							<a
								href={resolve('/book/[id]', { id: book.id })}
								class="block w-full rounded-2xl border border-stone-300 px-4 py-2 text-center text-sm font-medium transition hover:border-amber-700 hover:text-amber-700"
							>
								See more details
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
