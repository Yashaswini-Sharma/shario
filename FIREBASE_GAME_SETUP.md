# 🔥 Firebase Realtime Database Setup for Dress to Impress Game

## Step-by-Step Setup Guide

### 1. Firebase Console Setup

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project** or create a new one
3. **Enable Services:**
   - Authentication (Google sign-in)
   - Firestore Database (for cart/products)
   - **Realtime Database** (for game rooms)

### 2. Create Realtime Database

1. In Firebase Console, go to **"Realtime Database"**
2. Click **"Create Database"**
3. Choose your location (preferably close to your users)
4. **Start in test mode** initially

### 3. Configure Security Rules

Copy the rules from `firebase-realtime-rules.json` and paste them in Firebase Console:

1. Go to **Realtime Database > Rules**
2. Replace the existing rules with:

```json
{
	"rules": {
		"gameRooms": {
			".read": "auth != null",
			".write": "auth != null",
			"$roomId": {
				".read": "auth != null",
				".write": "auth != null",
				"players": {
					"$userId": {
						".read": "auth != null",
						".write": "auth != null && ($userId == auth.uid || root.child('gameRooms').child($roomId).child('players').child(auth.uid).exists())"
					}
				}
			}
		},
		"waitingRoom": {
			".read": "auth != null",
			".write": "auth != null",
			"$userId": {
				".read": "auth != null && $userId == auth.uid",
				".write": "auth != null && $userId == auth.uid"
			}
		}
	}
}
```

3. Click **"Publish"**

### 4. Update Environment Variables

Update your `.env.local` file with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFGH
```

**To get these values:**

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click on your web app or create one
4. Copy the config values
5. For Database URL: Go to **Realtime Database** and copy the URL from the top

### 5. Enable Google Authentication

1. Go to **Authentication > Sign-in method**
2. Enable **Google** sign-in provider
3. Add your domain to authorized domains if needed

### 6. Test the Setup

1. **Start your development server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Test the flow:**
   - Sign in with Google
   - Go to `/dress-to-impress`
   - Click "Enter Game"
   - Check browser console for errors

### 7. Troubleshooting

**Common Issues:**

1. **Permission Denied Error:**

   - Make sure Realtime Database rules are published
   - Verify user is authenticated before joining game
   - Check that Database URL is correct in environment variables

2. **Database URL Issues:**

   - Ensure the URL includes the protocol: `https://`
   - Make sure it ends with `/`
   - Check the URL in Firebase Console matches exactly

3. **Authentication Issues:**
   - Verify Google sign-in is enabled
   - Check that auth domain is correct
   - Make sure user is signed in before accessing game features

**Debug Steps:**

```javascript
// Add to browser console to debug
console.log("Firebase Config:", {
	databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

// Check auth state
import { auth } from "./lib/firebase";
console.log("Current user:", auth.currentUser);
```

### 8. Production Considerations

**Before deploying to production:**

1. **Update security rules** to be more restrictive
2. **Remove test mode** from Realtime Database
3. **Add proper validation** in security rules
4. **Set up monitoring** for database usage
5. **Configure backup** if needed

**Production Security Rules Example:**

```json
{
  "rules": {
    "gameRooms": {
      ".read": "auth != null",
      "$roomId": {
        ".write": "auth != null && (
          !data.exists() ||
          data.child('players').child(auth.uid).exists() ||
          data.child('currentPlayers').val() < data.child('maxPlayers').val()
        )",
        ".validate": "newData.hasChildren(['theme', 'budget', 'maxPlayers', 'currentPlayers', 'players'])",
        "players": {
          "$userId": {
            ".write": "auth != null && $userId == auth.uid",
            ".validate": "newData.hasChildren(['userId', 'displayName', 'ready', 'joinedAt'])"
          }
        }
      }
    }
  }
}
```

## 🎮 Game Features Now Available

- **Real-time Matchmaking**: Players get connected instantly
- **Random Themes & Budgets**: Each game has unique constraints
- **Live Lobby Updates**: See players join/leave in real-time
- **Game State Management**: Automatic progression through game phases
- **Disconnect Handling**: Players are removed when they leave

## 🚀 Ready to Play!

Once setup is complete, users can:

1. Sign in with Google
2. Click "Enter Game" on `/dress-to-impress`
3. Get matched with other players automatically
4. See real-time lobby updates
5. Start playing when enough players join!

The game will automatically create rooms, assign random themes and budgets, and manage the entire multiplayer experience through Firebase Realtime Database.
