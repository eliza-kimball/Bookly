import { json } from '@sveltejs/kit';

export async function GET({ fetch, url }) {
	const query = url.searchParams.get('q')?.trim() ?? '';

	if (!query) {
		return json({ items: [] });
	}

	const response = await fetch(
		`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&printType=books`
	);

	if (!response.ok) {
		return json({ error: 'Search failed' }, { status: response.status });
	}

	const data = await response.json();
	return json(data);
}
