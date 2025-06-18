# High-Low Card Game

A blockchain-based high-low card game built with Next.js, featuring wallet connectivity, Supabase database integration, and Chainlink Functions for NFT minting.

## Game Rules

1. **Basic Gameplay**:
   - Players predict whether the next card will be "higher" or "lower" than the current card (A is lowest, K is highest)
   - Players start with a score of 0
   - **Correct Guess**: Earn points based on consecutive correct guesses (streak × 5 points)
   - **Wrong Guess**: Lose 10 points (minimum score is 0), streak resets, game continues

2. **NFT Rewards**:
   - Players can mint NFTs based on their performance
   - Different NFT levels available based on score achievements
   - Powered by Chainlink Functions for secure off-chain data verification

## Tech Stack

- **Frontend**: Next.js 14.2.4 with App Router
- **Styling**: TailwindCSS 4.0
- **Wallet Integration**: wagmi 2.15.0 + RainbowKit 2.2.4
- **Database**: Supabase
- **Authentication**: JWT + Ethereum signature verification
- **Blockchain**: Chainlink Functions for NFT minting
- **Smart Contracts**: Solidity with OpenZeppelin ERC721
- **Animation**: Framer Motion
- **Language**: TypeScript

## Features

1. **Modern UI/UX**:
   - Responsive design with gradient backgrounds
   - Smooth animations and transitions
   - Card flip animations
   - Interactive game buttons with hover effects

2. **Wallet Integration**:
   - Multi-wallet support via RainbowKit
   - Ethereum signature-based authentication
   - Network switching support
   - Account management

3. **Game Mechanics**:
   - Real-time score tracking
   - Streak counter for consecutive wins
   - Score persistence in database
   - Leaderboard functionality

4. **NFT System**:
   - Score-based NFT minting
   - Chainlink Functions integration
   - Multiple NFT tiers based on achievements
   - On-chain verification of game scores

## Local Development

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- A Supabase account and project
- A WalletConnect project ID

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd high-low-card-game
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory and add the following:

```env
# RPC Configuration
NEXT_PUBLIC_RPC_URL=your-ethereum-rpc-url
ETHEREUM_PROVIDER=your-ethereum-provider-url

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_BASE_URL=your-supabase-base-url
SUPABASE_API_KEY=your-supabase-api-key

# JWT Secret for Authentication
JWT_SECRET=your-jwt-secret

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Blockchain Configuration (for smart contracts)
EVM_PRIVATE_KEY=your-evm-private-key
BUSS_CONTRACT_ADDRESS=your-contract-address
```

4. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## Database Setup

Create the following table in your Supabase project:

### `high_low` table (for Chainlink Functions)

| Column Name | Type      | Description          |
|-------------|-----------|----------------------|
| id          | uuid      | Primary key          |
| player      | text      | Player wallet address|
| score       | integer   | Player's score       |
| created_at  | timestamp | Record creation time |
| updated_at  | timestamp | Last update time     |

## Smart Contract Deployment

The project includes a Chainlink Functions consumer contract for NFT minting:

1. **Deploy the contract** to your preferred testnet (Sepolia recommended)
2. **Configure Chainlink Functions** using the provided scripts:
   ```bash
   npm run set-config
   ```
3. **Set up the DON secrets** for Supabase API access

## Deployment

This project can be deployed to Vercel, Netlify, or any platform that supports Next.js.

### Build for production

```bash
npm run build
# or
yarn build
```

### Deploy to Vercel

1. Connect your repository to Vercel
2. Add your environment variables in the Vercel dashboard
3. Deploy automatically on every push to main branch

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
