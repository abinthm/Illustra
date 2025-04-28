# Illustra

A modern web application built with React, TypeScript, and Vite.

## 🚀 Deployment

The application is deployed on Vercel:
- Production: [https://illustra-nine.vercel.app](https://illustra-nine.vercel.app)

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (built on Radix UI)
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Animations**: Tailwind CSS Animate

## 📦 Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd illustra
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following:
```env
VITE_API_URL=your_api_url
```

## 🚀 Development

To start the development server:

```bash
npm run dev
```

## 🏗️ Build

To build the project:

```bash
npm run build
```

For development build:
```bash
npm run build:dev
```

## 📁 Project Structure

- `src/` - Source code
  - `components/` - Reusable UI components
  - `config/` - Configuration files
  - `pages/` - Page components
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
  - `types/` - TypeScript type definitions

## 🔧 API Configuration

The API configuration is located in `src/config/api.ts`:
```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "https://2466-111-92-114-35.ngrok-free.app",
};
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
