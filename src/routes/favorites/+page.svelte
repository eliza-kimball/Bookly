<script lang="ts">
	import { resolve } from '$app/paths';
	import { favorites } from '$lib/stores/favorites';
</script>

<svelte:head>
	<title>Favorites | SupaProBook</title>
</svelte:head>

<div class="px-6 py-10">
	<div class="mx-auto max-w-6xl space-y-8">
		<div class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
			<p class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Favorites</p>
			<h1 class="mt-2 text-3xl font-bold tracking-tight">Your favorite books</h1>
			<p class="mt-3 max-w-2xl text-sm text-stone-600">
				Books you heart on the home page or shelves will appear here.
			</p>
		</div>

		{#if $favorites.length === 0}
			<div class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
				<p class="text-lg font-semibold">No favorites yet</p>
				<p class="mt-2 text-sm text-stone-600">
					Click the heart on any book card to add it to this page.
				</p>
			</div>
		{:else}
			<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each $favorites as book (book.id)}
					<div class="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
						<div class="relative flex h-56 items-center justify-center bg-stone-100 p-4">
							<button
								type="button"
								aria-label={`Remove ${book.title} from favorites`}
								class="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-white shadow-sm ring-1 ring-amber-700 transition"
								onclick={() => favorites.toggle(book)}
							>
								<span class="text-lg leading-none">♥</span>
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

						<div class="mt-auto space-y-3 p-4">
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
