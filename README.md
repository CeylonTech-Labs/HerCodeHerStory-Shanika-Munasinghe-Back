# HerCodeHerStory - Shanika Munasinghe Backend

Express.js, TypeScript, Prisma and MySQL backend for the HerCodeHerStory personal life-sharing platform.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and fill in real hosting secrets:

   ```bash
   cp .env.example .env
   ```

   Required values:

   ```env
   DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"
   JWT_SECRET="replace-with-a-long-random-secret"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   FRONTEND_URL="http://localhost:3000"
   BACKEND_URL="http://localhost:5000"
   ```

3. Generate Prisma Client:

   ```bash
   npm run prisma:generate
   ```

4. Create database tables:

   ```bash
   npm run prisma:migrate
   ```

5. Seed one admin user and the default categories:

   ```bash
   npm run prisma:seed
   ```

   Admin seed credentials:

   ```env
   SEED_ADMIN_EMAIL="shanika.uok2@gmail.com"
   SEED_ADMIN_PASSWORD="21PQshani@"
   ```

6. Run the development server:

   ```bash
   npm run dev
   ```

The API health check is available at `GET /health`.

## Main API Routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/posts`
- `GET /api/posts/featured`
- `GET /api/posts/:slug`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/tags`
- `POST /api/tags`
- `DELETE /api/tags/:id`
- `GET /api/comments`
- `POST /api/posts/:postId/comments`
- `PATCH /api/comments/:id/status`
- `DELETE /api/comments/:id`
- `GET /api/posts/:postId/reactions`
- `POST /api/posts/:postId/reactions`
- `GET /api/projects`
- `GET /api/projects/:slug`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/certificates`
- `POST /api/certificates`
- `PUT /api/certificates/:id`
- `DELETE /api/certificates/:id`
- `GET /api/achievements`
- `POST /api/achievements`
- `PUT /api/achievements/:id`
- `DELETE /api/achievements/:id`
- `GET /api/timeline`
- `POST /api/timeline`
- `PUT /api/timeline/:id`
- `DELETE /api/timeline/:id`
- `POST /api/media/upload`
- `GET /api/media`
- `DELETE /api/media/:id`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/contact`
- `GET /api/contact-messages`
- `PATCH /api/contact-messages/:id/status`
- `DELETE /api/contact-messages/:id`
- `GET /api/dashboard/stats`

Admin write, moderation, upload and dashboard endpoints require:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Posts Query Filters

`GET /api/posts` supports:

- `page`
- `limit`
- `search`
- `category` as category id or slug
- `tag` as tag id or slug
- `status` when an admin token is provided
- `featured=true`
