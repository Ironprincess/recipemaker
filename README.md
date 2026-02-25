# Fridge Recipe Builder

Track fridge ingredients and generate AI recipes using Claude, with your API key kept server-side.

## Tech Stack

- Next.js (App Router, TypeScript)
- Prisma + SQLite
- Anthropic SDK (`@anthropic-ai/sdk`)
- Zod validation
- Vitest for focused validation tests

## Setup

1. Install Node.js 20+ and npm.
2. Install dependencies:

```bash
npm install
```

3. Copy env values:

```bash
cp .env.example .env.local
```

4. Put your Claude API key into `.env.local`:

```env
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL="file:./dev.db"
```

5. Create the local database and Prisma client:

```bash
npm run prisma:migrate -- --name init
npm run prisma:generate
```

6. Start the app:

```bash
npm run dev
```

## API Endpoints

- `GET /api/inventory` - list ingredients
- `POST /api/inventory` - add ingredient
- `PATCH /api/inventory/:id` - update ingredient
- `DELETE /api/inventory/:id` - remove ingredient
- `POST /api/recipes/generate` - generate recipe from current inventory

## Tests

Run tests:

```bash
npm test
```

Current tests cover:
- ingredient create/update payload validation
- recipe response shape parsing

## Security Notes

- `ANTHROPIC_API_KEY` is read only in server code.
- The recipe route includes a simple in-memory rate guard.
- Claude requests are wrapped with a timeout to avoid long hangs.
