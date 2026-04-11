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

<div class="min-h-screen overflow-x-hidden bg-stone-100 text-stone-900">
	<div class="flex min-h-screen flex-col lg:flex-row">
		<aside class="min-h-screen border-b border-stone-200 bg-white lg:w-72 lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r">
			<div class="lg:sticky lg:top-0 lg:h-screen">
				<div class="px-6 py-6">
					<p class="text-brand text-xs font-semibold uppercase tracking-[0.28em]">Bookly</p>
				</div>

				<nav class="px-4 pb-6">
					<ul class="space-y-2">
						{#each navItems as item (item.href)}
							<li>
								<a
									href={resolve(item.href)}
									class={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
										page.url.pathname === item.href
										? 'bg-brand text-white'
										: 'text-stone-700 hover:bg-stone-100'
									}`}
								>
									{item.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</aside>

		<div class="flex min-h-screen min-w-0 flex-1 flex-col">
			<main class="min-w-0 flex-1">
				{@render children()}
			</main>
		</div>
	</div>
</div>
