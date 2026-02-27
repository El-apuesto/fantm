# fantm.ink

**Where Stories Come to Life**

AI-powered novel, memoir, and biography generation platform. Create professional-quality books with advanced chapter generation algorithms that maintain coherence throughout your story.

## Features

### Story Types
- **Novella** (~20,000 words) - $13 Normal / $15 Premium
- **Novel** (~50,000 words) - $21 Normal / $23 Premium
- **Memoir** (~30,000 words) - $17 Normal / $19 Premium
- **Autobiography** (~60,000 words) - $26 Normal / $28 Premium

### Premium Features
- AI-generated illustrations (Grok Vision)
- About the author section with image upload
- Premium A5 formatting
- Edit & regenerate sections (up to 10,000 words of edits)
- Priority generation

### Normal Features
- Complete story generation
- Professional PDF output
- Title page & table of contents
- Back cover blurb
- Standard formatting

## Architecture

### Frontend (Vercel)
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion animations
- Supabase Auth
- Square Web Payments SDK

### Backend (Render)
- Node.js + Express
- Grok API (xAI) for text generation
- Grok Vision for illustrations
- PDFKit for PDF generation
- Square API for payments
- Supabase for database

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Grok API (xAI) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Square |
| PDF Generation | PDFKit |
| Deployment | Vercel (frontend), Render (backend) |

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Grok API key (from xAI)
- Square developer account

### 1. Clone & Install

```bash
git clone <repo-url>
cd fantm.ink

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Setup Supabase

1. Create a new Supabase project
2. Run the SQL in `supabase-schema.sql`
3. Create storage buckets: `fantmink` (public) and `fantmink-private` (private)
4. Copy your project URL and anon key

### 3. Configure Environment Variables

**Frontend (.env)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
VITE_SQUARE_APP_ID=your-square-app-id
VITE_SQUARE_ENVIRONMENT=sandbox
```

**Backend (.env)**
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

GROK_API_KEY=your-grok-api-key

SQUARE_ACCESS_TOKEN=your-square-token
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=your-location-id
```

### 4. Run Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

## Generation Algorithm

The core of fantm.ink is a sophisticated block-based generation system:

1. **Block Structure**: Each chapter consists of 2 blocks
2. **Summaries**: After each block, a summary is generated
3. **Context**: Subsequent blocks reference all previous summaries
4. **Character Tracking**: Maintains character consistency throughout
5. **Plot Threads**: Distributes events across the narrative arc

This ensures coherent, high-quality storytelling that flows naturally from beginning to end.

## Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard.

### Backend (Render)

1. Connect your GitHub repo to Render
2. Use `render.yaml` for configuration
3. Set environment variables in Render dashboard

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user

### Stories
- `GET /api/stories` - List user's stories
- `POST /api/stories` - Create new story
- `GET /api/stories/:id` - Get story details
- `PATCH /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story

### Generation
- `POST /api/generate/start/:id` - Start generation
- `GET /api/generate/progress/:id` - Check progress
- `POST /api/generate/regenerate/:id` - Regenerate section (premium)

### Payments
- `GET /api/payments/pricing` - Get pricing
- `POST /api/payments/process` - Process payment

## Pricing Structure

| Package | Normal | Premium |
|---------|--------|---------|
| Novella | $13 | $15 |
| Novel | $21 | $23 |
| Memoir | $17 | $19 |
| Autobiography | $26 | $28 |

**Bundles:**
- 2 Premium Novels: $39 (save $7)
- 3 Premium Novels: $63 (save $6)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE for details

## Support

For questions or support, contact support@fantm.ink

---

**fantm.ink** - Where stories come to life.
