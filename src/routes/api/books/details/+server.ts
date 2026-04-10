import { json } from '@sveltejs/kit';

export async function GET({ fetch, url }) {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Missing book id' }, { status: 400 });
	}

	const response = await fetch(
		`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}`
	);

	if (!response.ok) {
		return json({ error: 'Book details failed' }, { status: response.status });
	}

	const data = await response.json();
	return json(data);
}
