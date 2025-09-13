# Art Gallery DataTable

A React application built with Vite and TypeScript that displays artworks from the Art Institute of Chicago API with advanced selection features.

## Quick Start

```bash
# Create project
npm create vite@latest art-gallery-table -- --template react-ts
cd art-gallery-table

# Install dependencies
npm install primereact primeicons axios

# Start development server
npm run dev
```

##  Dependencies

- **React 18** with TypeScript
- **Vite** for build tooling
- **PrimeReact** for DataTable component
- **Axios** for API calls

## Features

-  Server-side pagination (12 records per page)
-  Row selection with checkboxes
-  Bulk selection panel (select N rows across pages)
-  Persistent selection across page navigation
-  Individual row selection/deselection tracking
-  Memory optimized (no data accumulation)

##  Key Functionality

### Bulk Selection
- Click "Select Rows" button
- Enter number (e.g., 20)
- Selects first N rows across multiple pages
- If page 1 has 12 records and you select 20, remaining 8 auto-select on page 2

### Persistent Selection
- Manual selections persist when switching pages
- If you deselect a row on page 2, it stays deselected when you return
- Combines bulk + individual selections intelligently

##  Project Structure

```
src/
├── App.tsx              # Main component
├── main.tsx             # Entry point
├── index.css            # Styles
├── services/
│   └── artworkService.ts # API service
└── types/
    └── artwork.ts        # TypeScript types
```

