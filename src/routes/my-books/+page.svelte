<script lang="ts">
	import { bookshelf } from '$lib/stores/bookshelf';
	import { favorites } from '$lib/stores/favorites';

	let newShelfName = $state('');

	function createShelf() {
		bookshelf.createShelf(newShelfName);
		newShelfName = '';
	}
</script>

<svelte:head>
	<title>My Books | Bookly</title>
</svelte:head>

<div class="px-6 py-10">
	<div class="mx-auto max-w-6xl space-y-8">
		<div class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
			<p class="text-brand text-xs font-semibold uppercase tracking-[0.24em]">My Books</p>
			<h1 class="mt-2 text-3xl font-bold tracking-tight">Build your shelves</h1>
			<p class="mt-3 max-w-2xl text-sm text-stone-600">
				Create custom shelves, then add books to them from the home page.
			</p>
		</div>

		<form
			class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200"
			onsubmit={(event) => {
				event.preventDefault();
				createShelf();
			}}
		>
			<label class="mb-2 block text-sm font-medium" for="new-shelf">Create a new shelf</label>
			<div class="flex flex-col gap-3 md:flex-row">
				<input
					id="new-shelf"
					bind:value={newShelfName}
					class="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-brand"
					placeholder="Favorites, Summer Reads, Fantasy TBR..."
				/>
				<button
					type="submit"
					class="bg-brand hover:bg-brand-deep rounded-2xl px-5 py-3 font-semibold text-white transition"
				>
					Create shelf
				</button>
			</div>
		</form>

		{#if $bookshelf.shelves.length === 0}
			<div class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
				<p class="text-lg font-semibold">No shelves yet</p>
				<p class="mt-2 text-sm text-stone-600">
					Create your first shelf above, then go back home to start adding books.
				</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each $bookshelf.shelves as shelf (shelf.id)}
					{@const shelfBooks = $bookshelf.books.filter((book) => book.shelfIds.includes(shelf.id))}

					<section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
						<div class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<div>
								<p class="text-brand text-xs font-semibold uppercase tracking-[0.22em]">
									Shelf
								</p>
								<h2 class="mt-1 text-2xl font-bold tracking-tight">{shelf.name}</h2>
								<p class="mt-2 text-sm text-stone-600">
									{shelfBooks.length} {shelfBooks.length === 1 ? 'book' : 'books'}
								</p>
							</div>

							<button
								type="button"
								class="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-red-500 hover:text-red-600"
								onclick={() => bookshelf.deleteShelf(shelf.id)}
							>
								Delete shelf
							</button>
						</div>

						{#if shelfBooks.length === 0}
							<p class="text-sm text-stone-600">No books in this shelf yet.</p>
						{:else}
							<div class="flex gap-5 overflow-x-auto pb-2">
								{#each shelfBooks as book (book.id)}
									<div class="w-72 shrink-0 overflow-hidden rounded-3xl bg-stone-50 ring-1 ring-stone-200">
										<div class="relative flex h-56 items-center justify-center bg-white p-4">
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

											{#if book.coverUrl}
												<img
													class="max-h-full max-w-full object-contain shadow-sm"
													src={book.coverUrl}
													alt={book.title}
												/>
											{:else}
												<div class="text-center text-sm text-stone-500">No cover available</div>
											{/if}
										</div>

										<div class="space-y-3 p-4">
											<div>
												<h3 class="line-clamp-2 text-lg font-semibold">{book.title}</h3>
												<p class="text-sm text-stone-600">{book.author}</p>
											</div>

											<button
												type="button"
												class="w-full rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-red-500 hover:text-red-600"
												onclick={() => bookshelf.removeBookFromShelf(book.id, shelf.id)}
											>
												Remove from shelf
											</button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</section>
				{/each}
			</div>
		{/if}
	</div>
</div>
