# 3D Graphs Dashboard

An interactive analytics dashboard for exploring network topology and geographic activity in 3D. The project is built with Next.js, React, Three.js, and the Vasturiano graph libraries.

## Highlights

- **Topology graph:** explore connected nodes in top-down or radial layouts.
- **Globe graph:** inspect geographic data as points, animated arcs, or a heatmap.
- **Date filtering:** filter both visualizations by a shared minimum and maximum timestamp.
- **Interactive exploration:** navigate and inspect the 3D visualizations, with graph data refreshed through the dashboard API.
- **Data validation:** incoming topology and globe data is validated before it is used by the visualizations.

## Getting started

### Requirements

- Node.js (LTS recommended)
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then choose **Visit dashboard** to open the visualizations.

## Data and configuration

The dashboard requests topology and globe data from `POST /api/topology` and `POST /api/globe`. The repository includes sample data in [`data/topology.json`](./data/topology.json) and [`data/globe.json`](./data/globe.json); the API routes and repository layer provide the data used by the graphs.

Set `NEXT_PUBLIC_SITE_URL` when the app needs to call its API through a specific site origin. It can be left unset for local development, where requests use the current origin.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Build the production app. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |

## Built with

- [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- [Three.js](https://threejs.org/)
- [react-force-graph-3d](https://github.com/vasturiano/react-force-graph)
- [react-globe.gl](https://github.com/vasturiano/react-globe.gl)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query)

## Author

**Andres Burgos** — credited in the project’s Git history.
