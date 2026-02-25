# ThoughtSpot SE Demo Assistant

A React-based web application to assist Solution Engineers during demos with discovery questions, competitive differentiators, and objection handling.

## Features

- **Discovery Questions**: 15 categorized discovery questions with follow-ups for different industries and use cases
- **Competitive Differentiators**: Detailed comparisons against Tableau, Power BI, Looker, and Qlik
- **Objection Handling**: 12 common objections with responses, talking points, and discovery questions
- **Smart Filtering**: Filter content by industry, use case, competitor, and category
- **Global Search**: Search across all content in real-time
- **Dark Mode UI**: Professional dark theme optimized for demos
- **Expandable Cards**: Click any card to see detailed information
- **Easy Content Updates**: All content stored in editable JSON files

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at http://localhost:5173

## Project Structure

```
se-demo-assistant/
├── src/
│   ├── components/          # React components
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── TabNavigation.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── ContentDisplay.jsx
│   │   └── Card.jsx
│   ├── context/
│   │   └── AppContext.jsx   # Global state management
│   ├── data/                # Content JSON files
│   │   ├── discovery.json
│   │   ├── differentiators.json
│   │   ├── objections.json
│   │   └── categories.json
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Editing Content

All content is stored in JSON files in `src/data/`. You can edit these files directly to:

- Add new discovery questions
- Update competitive differentiators
- Add new objections and responses
- Modify categories and filters

After editing, the dev server will hot-reload automatically.

### Adding a Discovery Question

Edit `src/data/discovery.json`:

```json
{
  "id": "disc-16",
  "question": "Your question here?",
  "category": "technical",
  "industries": ["retail", "finance"],
  "useCases": ["analytics-modernization"],
  "priority": "high",
  "followUp": [
    "Follow-up question 1?",
    "Follow-up question 2?"
  ]
}
```

### Adding a Differentiator

Edit `src/data/differentiators.json` under the appropriate competitor:

```json
{
  "id": "diff-tableau-6",
  "category": "Category Name",
  "feature": "Feature Name",
  "thoughtspot": "ThoughtSpot advantage",
  "competitor": "Competitor limitation",
  "talkingPoints": [
    "Point 1",
    "Point 2"
  ],
  "demo": "Demo tip"
}
```

### Adding an Objection

Edit `src/data/objections.json`:

```json
{
  "id": "obj-13",
  "objection": "The objection statement",
  "category": "pricing",
  "response": "Your response",
  "talkingPoints": [
    "Point 1",
    "Point 2"
  ],
  "questions": [
    "Discovery question 1?",
    "Discovery question 2?"
  ]
}
```

## Usage Tips

1. **Start with Discovery**: Use the Discovery tab to prepare questions before the demo
2. **Filter by Industry/Use Case**: Narrow down relevant questions based on the prospect
3. **Use Search**: Quickly find specific topics or keywords
4. **Click to Expand**: Click any card to see full details and talking points
5. **Prep Differentiators**: Before competitor discussions, review relevant differentiators
6. **Handle Objections**: Keep the Objections tab handy for common pushbacks

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling with dark mode
- **React Context API** - State management

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Deployment

The built application is static files that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

Simply run `npm run build` and deploy the `dist/` folder.

## License

Internal use only - ThoughtSpot SE Team
