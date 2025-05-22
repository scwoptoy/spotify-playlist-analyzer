# System Architecture

## Technology Stack (Planned)

### Frontend
- **Framework**: React (decision pending)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js or D3.js
- **Routing**: React Router
- **State Management**: React Context or Redux (TBD)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: OAuth 2.0 (Spotify)

### Infrastructure
- **Frontend Hosting**: Vercel/Netlify
- **Backend Hosting**: Railway/Heroku
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions (future)

## API Integration
- **Primary**: Spotify Web API
- **Future**: Tidal API (Phase 4+)

## Data Flow (Planned)
1. User authenticates via Spotify OAuth
2. App fetches user's playlists
3. For selected playlist: fetch tracks + audio features
4. Analyze audio features for taste profile
5. Generate recommendations based on analysis
6. Present results with option to create new playlist

*Architecture decisions will be documented as ADRs in this file.*