# Spotify Full Text Search
This project demonstrates a Spotify-like search functionality using Next.js, Elasticsearch, and Docker designed to showcase system design concepts for technical interviews. This application provides a modern interface to search through thousands of songs, albums, and artists, similar to the Spotify experience.


## Tech Stack

- **Frontend**: Next.js with React
- **UI Components**: Material-UI (MUI)
- **Search Engine**: Elasticsearch
- **Language**: TypeScript
- **Package Manager**: pnpm


## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Elasticsearch (v9.x)
- Docker (optional, for running Elasticsearch)

## Features
- **Full-Text Search**: Search through songs, albums, and artists using Elasticsearch's powerful full-text search capabilities.
- **Real-time Search**: As you type, the search results update in real-time.
- **Responsive Design**: The application is designed to be responsive and works well on both desktop and mobile devices.
- **Docker Support**: Easily run Elasticsearch using Docker for local development.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

<!--
## Implementation Details
### Search Features
### Elasticsearch Mapping
 -->


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Vercel Documentation](https://vercel.com/docs) - learn about Vercel features and API.
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) - learn about Elasticsearch features and API.
- [Docker Documentation](https://docs.docker.com/) - learn about Docker features and API.
- [Spotify API Documentation](https://developer.spotify.com/documentation/web-api/) - learn about Spotify API features and API.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
