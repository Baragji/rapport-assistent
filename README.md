# Rapport Assistent

A modern web application for creating, managing, and visualizing reports with ease.

## Features

- Create reports with a user-friendly form interface
- Support for Markdown formatting in report content
- Export reports to DOCX format
- Visualize report statistics with interactive charts
- Responsive design with Tailwind CSS
- AI-assisted content generation for report sections
- Reference management with citation support
- Privacy-focused analytics for AI feature usage
- User feedback collection for AI-generated content

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Form Handling**: React JSON Schema Form (@rjsf/core)
- **Data Visualization**: Chart.js with react-chartjs-2
- **Document Generation**: md-to-docx for Markdown to DOCX conversion
- **AI Integration**: OpenAI SDK with custom client implementation
- **Analytics**: Custom privacy-focused analytics service
- **Testing**: Vitest with React Testing Library
- **Code Quality**: ESLint and Prettier
- **Performance**: Custom performance monitoring

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
│   │   ├── AIAssistButton.tsx    # AI assistance button component
│   │   ├── AIFeedback.tsx        # AI feedback collection component
│   │   ├── PieChart.tsx          # Data visualization component
│   │   ├── References.tsx        # Reference management component
│   │   └── ReportForm.tsx        # Main form component
│   ├── hooks/          # Custom React hooks
│   │   └── useAI.ts    # Hook for AI-assisted content generation
│   ├── services/       # Service layer
│   │   ├── aiClient.ts           # OpenAI client implementation
│   │   ├── aiClientLazy.ts       # Lazy-loaded AI client
│   │   ├── analyticsService.ts   # Analytics service
│   │   ├── feedbackService.ts    # User feedback service
│   │   └── promptService.ts      # Prompt template management
│   ├── templates/      # AI prompt templates
│   ├── utils/          # Utility functions
│   │   ├── documentUtils.ts      # DOCX generation utilities
│   │   ├── featureFlags.ts       # Feature flag management
│   │   └── performanceMonitor.ts # Performance monitoring
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── docs/               # Documentation
├── .env.example        # Environment variables template
├── .eslintrc.cjs       # ESLint configuration
├── .prettierrc         # Prettier configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── vitest.config.ts    # Vitest configuration
```

## AI Features

Rapport Assistent includes several AI-powered features to enhance the report creation process:

### AI-Assisted Content Generation

- **Smart Suggestions**: Get AI-powered suggestions for improving report sections
- **Context-Aware**: AI takes into account your existing content and references
- **Template-Based**: Uses specialized prompt templates for different report sections
- **Real-Time Streaming**: See AI-generated content appear in real-time

### Reference Management

- **Citation Support**: Automatically format references according to academic standards
- **Reference Integration**: AI suggestions incorporate your provided references
- **Easy Management**: Add, remove, and reorder references with a user-friendly interface

### Privacy & Analytics

- **Privacy-Focused**: No personal data is collected in analytics
- **Usage Metrics**: Track AI feature usage, success rates, and response times
- **Performance Monitoring**: Optimize AI response times and user experience
- **User Feedback**: Collect and analyze feedback on AI-generated content

### Technical Implementation

- **Custom AI Client**: Robust error handling and retry mechanisms
- **Lazy Loading**: AI components are loaded only when needed
- **Feature Flags**: Easy enabling/disabling of AI features
- **Comprehensive Testing**: 226 tests with 76.45% code coverage

## Environment Setup

To use the AI features, you need to set up your OpenAI API key:

1. Copy `.env.example` to `.env`
2. Add your OpenAI API key to the `.env` file:
   ```
   VITE_OPENAI_API_KEY=your-api-key-here
   ```

## License

This project is licensed under the MIT License.
