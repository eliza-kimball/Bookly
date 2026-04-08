<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { children } = $props();

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'My Books', href: '/my-books' },
		{ label: 'Favorites', href: '/favorites' }
	] as const;
</script>

<svelte:head>
</svelte:head>

<div class="min-h-screen bg-stone-100 text-stone-900">
	<div class="flex min-h-screen flex-col lg:flex-row">
		<aside class="border-b border-stone-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
			<div class="px-6 py-6">
				<p class="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Bookly</p>
				<h1 class="mt-2 text-2xl font-bold tracking-tight">Your reading space</h1>
			</div>

			<nav class="px-4 pb-6">
				<ul class="space-y-2">
					{#each navItems as item (item.href)}
						<li>
							<a
								href={resolve(item.href)}
								class={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
									page.url.pathname === item.href
										? 'bg-amber-700 text-white'
										: 'text-stone-700 hover:bg-stone-100'
								}`}
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</aside>

		<div class="flex min-h-screen flex-1 flex-col">
			<main class="flex-1">
				{@render children()}
			</main>
		</div>
	</div>
</div>
