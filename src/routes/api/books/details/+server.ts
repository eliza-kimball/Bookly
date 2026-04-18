import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

export async function GET({ fetch, url }) {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Missing book id' }, { status: 400 });
	}

	const booksUrl = new URL(`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}`);

	if (env.GOOGLE_BOOKS_API_KEY) {
		booksUrl.searchParams.set('key', env.GOOGLE_BOOKS_API_KEY);
	}

	const response = await fetch(booksUrl.toString());

	if (!response.ok) {
		return json({ error: 'Book details failed' }, { status: response.status });
	}

	const data = await response.json();
	return json(data, {
		headers: {
			'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400'
		}
	});
}
