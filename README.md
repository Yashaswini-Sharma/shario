# Share.io - Fashion Community Platform

A modern fashion e-commerce platform with community features built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## Features

- 🛍️ **Fashion E-commerce**: Browse and shop fashion items
- 👥 **Community Features**: Join and create fashion communities
- 🔐 **Google Authentication**: Secure login with Google OAuth
- 🎫 **Invite System**: Generate and manage community invite codes
- � **Real-time Messaging**: Chat with community members
- 📢 **Page Sharing**: Instantly share pages with community members
- �📱 **Responsive Design**: Mobile-first design with modern UI
- 🔥 **Firebase Integration**: Real-time database and authentication
- 🌐 **WebSocket Communication**: Real-time updates and notifications

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **UI Components**: Radix UI (shadcn/ui)
- **Backend**: Firebase (Auth, Firestore)
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yashaswini-Sharma/shario.git
   cd shario
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Firebase**

   a. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)

   b. Enable Authentication with Google provider

   c. Create a Firestore database

   d. Copy your Firebase config from Project Settings

4. **Configure environment variables**

   Copy `.env` and fill in your Firebase configuration:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Auth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

5. **Run the development servers**
   ```bash
   # Option 1: Run both servers together
   pnpm run dev:full

   # Option 2: Run servers separately
   # Terminal 1 - WebSocket server
   pnpm run server

   # Terminal 2 - Next.js app
   pnpm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup Details

### Authentication
- Enable Google Sign-in in Firebase Authentication
- Add your domain to authorized domains
- Configure OAuth redirect URIs if needed

### Firestore Security Rules
Add these basic security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Communities can be created by authenticated users and read by all authenticated users
    match /communities/{communityId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (resource.data.creatorId == request.auth.uid ||
         resource.data.members.hasAny([request.auth.uid]));
    }

    // Invite codes can be created and read by authenticated users
    match /inviteCodes/{codeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

## Real-time Features

### Community Chat
- **Real-time Messaging**: Send and receive messages instantly
- **Page Sharing**: Share current page with all community members
- **Connection Status**: See who's online and connection status
- **Auto-scroll**: Messages automatically scroll to show latest content

### Floating Action Buttons
- **Share Page Button**: Instantly share your current page
- **Community Panel**: Quick access to community features
- **Seamless Integration**: Works across all pages

### WebSocket Server
The app includes a Node.js WebSocket server that handles:
- Real-time message broadcasting
- User presence tracking
- Page sharing notifications
- Community room management

## Available Scripts

- `pnpm run dev` - Start Next.js development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run server` - Start WebSocket server
- `pnpm run dev:full` - Start both Next.js and WebSocket servers

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
Make sure to set the environment variables for Firebase configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── header.tsx        # Main navigation header
│   ├── community-popup.tsx    # Community management modal
│   ├── community-messaging.tsx # Real-time messaging component
│   └── floating-share-button.tsx # Floating action buttons
├── lib/                   # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── firebase-services.ts # Firebase service functions
│   ├── auth-context.tsx  # Authentication context
│   ├── websocket-context.tsx # WebSocket context
│   └── utils.ts          # General utilities
├── server/               # WebSocket server
│   └── index.js         # Socket.io server implementation
└── public/               # Static assets
```

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub.
