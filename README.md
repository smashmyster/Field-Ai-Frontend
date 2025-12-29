# Voice AI Frontend (Next.js)

A Next.js frontend application for a voice AI system with real-time chat, voice interaction, and file upload capabilities.

## Prerequisites

- Node.js (v18 or higher)
- Backend server running (see backend README)
- npm, yarn, pnpm, or bun package manager

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**To get a Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key and add it to your `.env.local` file
6. (Optional) Restrict the API key to your domain for security

**Note:** The frontend connects to the backend at `http://localhost:4000` by default. If your backend runs on a different URL, update the `API_BASE_URL` in `types/contstants.ts`.

### 3. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 4. Production Build

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Test Credentials

Use the following credentials to log in to the application:

- **Email:** `dyorajackson@gmail.com`
- **Password:** `123456`

## Features

- **Real-time Chat**: WebSocket-based chat interface
- **Voice Interaction**: Voice input and output capabilities
- **File Upload**: Upload and manage documents
- **Authentication**: Secure login and session management
- **Conversation History**: View and manage past conversations

## Project Structure

```
app/
├── (dashboard)/      # Protected dashboard routes
│   ├── chat/         # Chat interface
│   ├── history/      # Conversation history
│   ├── settings/     # User settings
│   └── policies/     # Policies page
├── login/            # Login page
└── layout.tsx        # Root layout

components/
├── VoiceChat.tsx     # Voice chat component
├── ChatMessages.tsx  # Chat messages display
├── FileUpload.tsx    # File upload component
└── ...               # Other components

context/
├── AuthContext.tsx   # Authentication context
└── SocketContext.tsx # WebSocket context
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run pm2:start` - Start with PM2
- `npm run pm2:stop` - Stop PM2 process
- `npm run pm2:logs` - View PM2 logs

## Backend Connection

The frontend connects to the backend API at `http://localhost:4000`. Make sure the backend server is running before starting the frontend.

## Troubleshooting

- **Connection Issues**: Ensure the backend server is running on port 4000
- **Authentication Errors**: Verify your credentials and check backend authentication endpoints
- **WebSocket Issues**: Check that the backend WebSocket gateway is properly configured

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
