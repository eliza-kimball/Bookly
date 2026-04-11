<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { bookshelf } from '$lib/stores/bookshelf';
	import type { Book } from '$lib/types';

	let title = $state('');
	let author = $state('');
	let coverUrl = $state('');
	let description = $state('Loading description...');
	let isLoading = $state(true);
	let selectedShelfId = $state('');

	function stripHtml(html: string) {
		return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
	}

	function currentBook(): Book {
		return {
			id: page.params.id ?? '',
			title,
			author,
			coverUrl: coverUrl || null,
			description
		};
	}

	function addCurrentBookToShelf() {
		if (!selectedShelfId || !page.params.id) {
			return;
		}

		bookshelf.addBookToShelf(currentBook(), selectedShelfId);
	}

	function selectedShelfContainsCurrentBook() {
		if (!selectedShelfId || !page.params.id) {
			return false;
		}

		return $bookshelf.books.some(
			(book) => book.id === page.params.id && book.shelfIds.includes(selectedShelfId)
		);
	}

	async function loadBookDetails() {
		const rawId = page.params.id;

		if (!rawId) {
			description = 'Could not load book details right now.';
			isLoading = false;
			return;
		}

		const bookId = decodeURIComponent(rawId);
		title = 'Untitled';
		author = 'Unknown author';
		coverUrl = '';

		try {
			const response = await fetch(`/api/books/details?id=${encodeURIComponent(bookId)}`);

			if (!response.ok) {
				throw new Error('Failed to load book');
			}

			const data = await response.json();
			const info = data.volumeInfo ?? {};
			title = info.title ?? 'Untitled';
			author = info.authors?.[0] ?? 'Unknown author';
			coverUrl = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? '';
			description = info.description
				? stripHtml(info.description)
				: 'No description available for this book yet.';
		} catch {
			description = 'Could not load book details right now.';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		selectedShelfId = $bookshelf.shelves[0]?.id ?? '';
		loadBookDetails();
	});
</script>

<svelte:head>
	<title>{title ? `${title} | Bookly` : 'Book Details | Bookly'}</title>
</svelte:head>

<div class="px-6 py-10">
	<div class="mx-auto grid max-w-5xl gap-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-200 lg:grid-cols-[260px_1fr]">
		<div class="flex min-h-80 items-center justify-center rounded-3xl bg-stone-100 p-6">
			{#if coverUrl}
				<img class="max-h-full max-w-full object-contain shadow-sm" src={coverUrl} alt={title} />
			{:else}
				<div class="text-center text-sm text-stone-500">No cover available</div>
			{/if}
		</div>

		<div>
			<p class="text-brand text-xs font-semibold uppercase tracking-[0.24em]">Book Details</p>
			<h1 class="mt-2 text-4xl font-bold tracking-tight">{title}</h1>
			<p class="mt-3 text-lg text-stone-600">{author}</p>

			<div class="mt-6 rounded-3xl bg-stone-50 p-6">
				<h2 class="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Add To Shelf</h2>

				{#if $bookshelf.shelves.length > 0}
					<div class="mt-4 space-y-3">
						<select
							class="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
							bind:value={selectedShelfId}
						>
							{#each $bookshelf.shelves as shelf (shelf.id)}
								<option value={shelf.id}>{shelf.name}</option>
							{/each}
						</select>

						<button
							type="button"
							class={`w-full rounded-2xl border px-4 py-3 text-sm font-medium transition ${
								selectedShelfContainsCurrentBook()
									? 'border-brand bg-brand-soft text-brand-deep'
									: 'border-stone-300 hover:border-brand hover:text-brand'
							}`}
							onclick={addCurrentBookToShelf}
						>
							{selectedShelfContainsCurrentBook() ? 'Added to shelf' : 'Add to shelf'}
						</button>
					</div>
				{:else}
					<a
						href={resolve('/my-books')}
						class="mt-4 block rounded-2xl border border-dashed border-stone-300 px-4 py-3 text-center text-sm font-medium transition hover:border-brand hover:text-brand"
					>
						Create a shelf first
					</a>
				{/if}
			</div>

			<div class="mt-8 rounded-3xl bg-stone-50 p-6">
				<h2 class="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Description</h2>
				{#if isLoading}
					<p class="mt-4 text-sm text-stone-600">Loading details...</p>
				{:else}
					<p class="mt-4 leading-7 text-stone-700">{description}</p>
				{/if}
			</div>

			<a
				href={resolve('/')}
				class="mt-6 inline-block rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-brand hover:text-brand"
			>
				Back to search
			</a>
		</div>
	</div>
</div>
