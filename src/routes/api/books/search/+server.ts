import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

export async function GET({ fetch, url }) {
	const query = url.searchParams.get('q')?.trim() ?? '';

	if (!query) {
		return json({ items: [] });
	}

	const booksUrl = new URL('https://www.googleapis.com/books/v1/volumes');
	booksUrl.searchParams.set('q', query);
	booksUrl.searchParams.set('maxResults', '12');
	booksUrl.searchParams.set('printType', 'books');

	if (env.GOOGLE_BOOKS_API_KEY) {
		booksUrl.searchParams.set('key', env.GOOGLE_BOOKS_API_KEY);
	}

	const response = await fetch(booksUrl.toString());

	if (!response.ok) {
		return json({ error: 'Search failed' }, { status: response.status });
	}

	const data = await response.json();
	return json(data, {
		headers: {
			'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400'
		}
	});
}
