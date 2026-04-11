# Bookly

Bookly is a personal book discovery and bookshelf organizer built with SvelteKit and Tailwind CSS. Users can search for books, view book details, save books to custom shelves, and mark favorites.

## Features

- Search for books by title, author, or subject using the Google Books API
- Browse quick search categories such as Fiction, Fantasy, Romance, and Mystery
- View a details page for each book with cover, author, and description
- Create custom shelves on the `My Books` page
- Add books to different shelves from the home page or the details page
- Remove books from shelves
- Mark and unmark favorite books with a heart button
- View all favorite books on the `Favorites` page
- Keep shelves and favorites saved in local storage

## Framework Choice

This project uses SvelteKit as its JavaScript framework.

I chose SvelteKit because it makes it easier to build interactive user interfaces without a lot of extra code. It works well for this project because the app needs search, dynamic rendering, multiple pages, local state management, and reusable UI components. SvelteKit also provides a clean routing system, which made it straightforward to build separate pages for the home screen, book details, shelves, and favorites.

## Tech Stack

- SvelteKit
- Svelte
- Tailwind CSS
- TypeScript
- Google Books API

## Run Locally

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

## Build

Create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```
