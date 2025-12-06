# LV4 Week 2 Day 5 – Movies API (Supabase + Express)

This project is a small RESTful API built with Express and Supabase for managing a simple collection of movies. It exposes CRUD endpoints under `/items` that read and write to a `movies_simple` table in Supabase, with structured error handling and input validation.

## Features

- RESTful API for a `movies_simple` movie table
- Full CRUD support:
  - `GET /items` – list all movies
  - `GET /items/:id` – get a single movie by ID
  - `POST /items` – create a movie
  - `PUT /items/:id` – update a movie
  - `DELETE /items/:id` – delete a movie
- Centralized error handling with a consistent JSON error shape
- 404 handler for unknown routes
- Validation middleware for:
  - Required request body
  - Valid UUID v4 IDs
  - Required fields for movies
  - Allowed fields whitelist (blocks unexpected properties)
- Supabase client and configuration pulled from environment variables
- CORS enabled and JSON body parsing

## Tech Stack

- **Runtime:** Node.js
- **Server:** Express
- **Database:** Supabase (PostgreSQL)
- **Auth/Client:** `@supabase/supabase-js`
- **Environment management:** `dotenv`
- **Middleware:**
  - `cors`
  - Custom validators and error handlers

## Project Structure

```text
.
└── src/
    ├── app.js                # Express app setup, global error handler, 404 handler
    ├── config.js             # Loads environment variables and exposes config
    ├── data-ref.js           # Example movie data shape (reference only)
    ├── index.js              # Entry point that starts the HTTP server
    │
    ├── middleware/
    │   └── validators.js     # Request body, ID, and payload validation
    │
    ├── routes/
    │   ├── items.js          # Main router that mounts sub-routers
    │   ├── read.js           # GET /items
    │   ├── find.js           # GET /items/:id
    │   ├── add.js            # POST /items
    │   ├── update.js         # PUT /items/:id
    │   └── del.js            # DELETE /items/:id
    │
    └── utils/
        ├── sendError.js      # Helper for constructing Error objects with metadata
        └── supabase.js       # Supabase client initialization
```

## Environment Configuration

Environment variables are loaded via `dotenv` and used in `config.js` and `utils/supabase.js`.

Required environment variables:

```bash
PORT=3000              # Optional, defaults to 3000
NODE_ENV=development   # or test, production, etc.
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

You can place these in a `.env` file at the project root:

```bash
# .env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

The `config` object is exported from `src/config.js` and used by the server and error handler.

## Movies Data Model

The API works against a `movies_simple` table in Supabase. A reference shape is defined in `src/data-ref.js`:

```json
{
  "imdb_id": "tt4172430",
  "title": "13 Hours: The Secret Soldiers of Benghazi",
  "year": 2016,
  "runtime": "2:24:29",
  "rating": "R",
  "poster": "https://image.tmdb.org/t/p/original/AskDcQ6Sa6jImyt2KDQbgRuPebH.jpg",
  "genres": ["War", "Action", "History", "Drama", "Thriller"]
}
```

### Allowed Fields

The following fields are allowed in the request body and will be validated:

- `imdb_id` (required)
- `title` (required)
- `year` (required, number > 1900)
- `runtime`
- `rating`
- `poster`
- `genres` (array)

Any extra fields will cause a validation error.

### Validation Rules

Validation is handled in `middleware/validators.js` and includes:

- **Body required:** request body must exist and not be empty.
- **ID format:** `id` path param must be a valid UUID v4.
- **Required fields:** `imdb_id`, `title`, and `year` must be present.
- **`imdb_id` format:** must match the pattern `^tt\d{7,}$`.
- **`year` type:** must be a number.
- **`year` minimum:** must be greater than 1900.
- **Allowed fields:** request body must not contain fields outside the allowed list.

## API Endpoints

Base URL (local example):

```text
http://localhost:3000
```

All endpoints are mounted under `/items` in `src/app.js`.

### GET /items

Fetch all movies.

**Request:**

```http
GET /items HTTP/1.1
Host: localhost:3000
Accept: application/json
```

**Success Response:**

- **Status:** `200 OK` (or `404` if no items are found)
- **Body:**

```json
{
  "ok": true,
  "records": 3,
  "data": [
    {
      "id": "uuid-v4-id",
      "imdb_id": "tt4172430",
      "title": "13 Hours: The Secret Soldiers of Benghazi",
      "year": 2016,
      "runtime": "2:24:29",
      "rating": "R",
      "poster": "https://...",
      "genres": ["War", "Action", "History", "Drama", "Thriller"]
    }
  ]
}
```

If there are no rows:

```json
{
  "ok": true,
  "message": "No items found",
  "data": []
}
```

### GET /items/:id

Fetch a single movie by its `id` (UUID v4).

**Request:**

```http
GET /items/{id} HTTP/1.1
Host: localhost:3000
Accept: application/json
```

**Success Response:**

- **Status:** `200 OK`
- **Body:**

```json
{
  "ok": true,
  "records": 1,
  "data": {
    "id": "uuid-v4-id",
    "imdb_id": "tt4172430",
    "title": "13 Hours: The Secret Soldiers of Benghazi",
    "year": 2016
  }
}
```

### POST /items

Create a new movie record.

**Request:**

```http
POST /items HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "imdb_id": "tt1234567",
  "title": "New Movie",
  "year": 2024,
  "runtime": "1:45:00",
  "rating": "PG-13",
  "poster": "https://example.com/poster.jpg",
  "genres": ["Action", "Drama"]
}
```

**Success Response:**

- **Status:** `201 Created`
- **Body:**

```json
{
  "ok": true,
  "records": 1,
  "message": "Item added successfully",
  "data": {
    "id": "uuid-v4-id",
    "imdb_id": "tt1234567",
    "title": "New Movie",
    "year": 2024,
    "runtime": "1:45:00",
    "rating": "PG-13",
    "poster": "https://example.com/poster.jpg",
    "genres": ["Action", "Drama"]
  }
}
```

If validation fails, a `422` response is returned (see **Error Handling** below).

### PUT /items/:id

Update an existing movie by `id`.

**Request:**

```http
PUT /items/{id} HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "imdb_id": "tt1234567",
  "title": "Updated Movie Title",
  "year": 2025,
  "runtime": "1:50:00"
}
```

**Success Response:**

- **Status:** `200 OK`
- **Body:**

```json
{
  "ok": true,
  "records": 1,
  "message": "Item updated successfully",
  "data": {
    "id": "uuid-v4-id",
    "imdb_id": "tt1234567",
    "title": "Updated Movie Title",
    "year": 2025,
    "runtime": "1:50:00"
  }
}
```

If the record does not exist, a `404` error is returned.

### DELETE /items/:id

Delete an existing movie by `id`.

**Request:**

```http
DELETE /items/{id} HTTP/1.1
Host: localhost:3000
Accept: application/json
```

**Success Response:**

- **Status:** `200 OK`
- **Body:**

```json
{
  "ok": true,
  "records": 1,
  "message": "Item deleted successfully",
  "data": {
    "id": "uuid-v4-id",
    "imdb_id": "tt1234567",
    "title": "New Movie",
    "year": 2024
  }
}
```

If the record does not exist, a `404` error is returned.

## Error Handling

All errors eventually pass through the global error handler in `src/app.js`, which produces a consistent JSON error structure:

```json
{
  "ok": false,
  "error": {
    "status": 422,
    "message": "Missing required fields",
    "code": "VALIDATION_ERROR",
    "details": {
      "missing": ["imdb_id", "title"]
    }
  }
}
```

### Error Shape

- `ok`: always `false` for errors
- `error.status`: HTTP status code (e.g. 400, 404, 422, 500)
- `error.message`: human-readable message
- `error.code`: machine-friendly error code (e.g. `INVALID_ID`, `VALIDATION_ERROR`, `READ_ERROR`, `INSERT_ERROR`, `UPDATE_ERROR`, `DELETE_ERROR`, `NOT_FOUND`)
- `error.details` (optional): additional data about the error (missing fields, invalid values, etc.)

### 404 Handler

Unknown routes are handled by a dedicated 404 middleware, which uses `sendError` to produce a `NOT_FOUND` error including the path and method that were requested.

### Invalid JSON

If the incoming JSON body is malformed, the app intercepts the `SyntaxError` and returns:

```json
{
  "ok": false,
  "error": {
    "status": 400,
    "message": "Invalid JSON body",
    "code": "INVALID_JSON"
  }
}
```

## Setup & Running Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create and configure `.env`**

   ```bash
   cp .env.example .env   # if you have a template, otherwise create .env manually
   # then edit .env and fill in your SUPABASE_URL and SUPABASE_ANON_KEY
   ```

4. **Run the server**

   You can start the server however you prefer (for example):

   ```bash
   node src/index.js
   ```

   The server will log:

   ```text
   Server listening on port 3000
   ```

5. **Test with a REST client**

   Use a tool like VS Code REST client, Thunder Client, Insomnia, or Postman to send requests to:

   - `GET http://localhost:3000/items`
   - `POST http://localhost:3000/items`
   - `GET http://localhost:3000/items/:id`
   - `PUT http://localhost:3000/items/:id`
   - `DELETE http://localhost:3000/items/:id`

Make sure your Supabase project has a `movies_simple` table with columns that match the movie data model described above.
