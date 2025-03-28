# Online Clipboard

An online clipboard application for seamless data sharing between users. The system allows users to paste text or data, generate a unique shareable code, and enable others to retrieve the shared data by entering the generated code.

## Features

- **Paste & Share**: Paste text in a text field and get a unique code
- **Generate Code**: Unique 6-character codes for sharing
- **Retrieve Data**: Enter a code to retrieve shared content
- **Temporary Storage**: Data automatically expires after 24 hours
- **Real-Time Updates**: Changes are reflected in real-time for all users with the same code
- **User History**: Track your previously created clipboards
- **Retrieval Statistics**: See how many times your shared content has been accessed
- **Active Viewers**: Monitor how many users are currently viewing your shared content
- **Modern UI**: Beautiful and responsive design with Tailwind CSS
- **Security**: Data is stored securely and transmitted over HTTPS

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: Redis for fast, temporary data storage
- **Real-Time**: Socket.io for real-time updates

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Redis server

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following:
   ```
   PORT=5000
   REDIS_URL=redis://localhost:6379
   DATA_EXPIRY=86400
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. **Share Content**:
   - Enter text in the textarea
   - Click "Share" to generate a unique code
   - Copy and share the code with others

2. **Retrieve Content**:
   - Enter the code in the input field
   - Click "Retrieve" to get the shared content

3. **View History**:
   - Click "Show History" to see your previously created clipboards
   - Click "Open" on any clipboard to access it again

4. **Track Statistics**:
   - View the number of times your shared content has been accessed
   - See when the clipboard was created
   - Monitor how many users are currently viewing your content

## License

MIT 