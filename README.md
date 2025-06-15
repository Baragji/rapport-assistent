# Rapport Assistent

A modern web application for creating, managing, and visualizing reports with ease.

## Features

- Create reports with a user-friendly form interface
- Support for Markdown formatting in report content
- Export reports to DOCX format
- Visualize report statistics with interactive charts
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Form Handling**: React JSON Schema Form (@rjsf/core)
- **Data Visualization**: Chart.js with react-chartjs-2
- **Document Generation**: md-to-docx for Markdown to DOCX conversion
- **Testing**: Vitest with React Testing Library
- **Code Quality**: ESLint and Prettier

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rapport-assistent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run preview` - Preview the production build locally

## Project Structure

```
rapport-assistent/
├── public/             # Static assets
├── src/                # Source code
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # React components
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── .eslintrc.cjs       # ESLint configuration
├── .prettierrc         # Prettier configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── vitest.config.ts    # Vitest configuration
```

## License

This project is licensed under the MIT License.
