# SharpLook Admin Dashboard

A modern, fully-featured admin dashboard built with React, TypeScript, and Tailwind CSS for the SharpLook platform.

## 🚀 Features

- **🔐 Authentication**: Secure admin login with JWT tokens
- **👥 User Management**: View, update, delete users and verify vendors
- **📁 Category Management**: CRUD operations for service categories
- **📊 Analytics Dashboard**: Comprehensive analytics and reporting
- **⚖️ Dispute Resolution**: Manage and resolve customer disputes
- **🎁 Referral Tracking**: Monitor referral program performance
- **🎨 Modern UI**: Clean, responsive design with Tailwind CSS
- **📱 Fully Responsive**: Works on all devices
- **⚡ Fast**: Built with Vite for lightning-fast development

## 🏗️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Charts**: Recharts

## 📁 Project Structure

```
sharplook-admin/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   └── ui/             # UI primitives (Button, Input, Card, etc.)
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layouts
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions and constants
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── README.md              # This file
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- SharpLook API running on `http://localhost:5000`

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the API URL if needed:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

## 🔑 Login

Access the admin dashboard with admin credentials:

- **Email**: admin@sharplook.com
- **Password**: Your admin password
- **Note**: Only users with `role: 'admin'` can access the dashboard

## 📖 Pages

### Dashboard (`/dashboard`)
- Overview statistics
- Recent activity
- Quick action buttons

### Users (`/users`)
- User list with search and pagination
- Update user status
- Verify vendors
- Delete users

### Categories (`/categories`)
- Create, edit, delete categories
- Toggle category status

### Analytics (`/analytics`)
- User analytics
- Booking analytics
- Revenue analytics
- Service analytics
- Export functionality

### Disputes (`/disputes`)
- View all disputes
- Resolve disputes with refund options
- Add admin notes

### Referrals (`/referrals`)
- Referral statistics
- Complete referral list
- Status tracking

## 🔌 API Integration

The application connects to the SharpLook API. Key services include:

- **AuthService**: Authentication and token management
- **UserService**: User CRUD operations
- **CategoryService**: Category management
- **AnalyticsService**: Dashboard and analytics data
- **DisputeService**: Dispute management
- **ReferralService**: Referral tracking

## 🎨 Customization

### Colors

The primary color is set to red (`#FF0000`). To change it, edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Update these values
        500: '#FF0000',
        600: '#CC0000',
        // ...
      },
    },
  },
},
```

### Components

All UI components are in `src/components/ui/` and can be customized:

- `Button.tsx` - Button styles and variants
- `Input.tsx` - Input fields
- `Card.tsx` - Card containers
- `Modal.tsx` - Modal dialogs
- `Loading.tsx` - Loading spinners

## 🔒 Security

- JWT tokens stored in localStorage
- Automatic token refresh
- Protected routes with authentication checks
- Admin role verification
- HTTPS recommended for production

## 📝 Development

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/layout/Sidebar.tsx`
4. Create service functions if needed in `src/services/`

### Creating a Custom Hook

1. Add hook in `src/hooks/`
2. Use TypeScript for type safety
3. Follow the `useDataFetch` pattern for API calls

### Adding New API Endpoints

1. Add endpoint constant in `src/utils/constants.ts`
2. Create service method in appropriate service file
3. Create custom hook in `src/hooks/useData.ts`

## 🧪 Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting (run `npm run lint`)
- **Prettier**: Code formatting (recommended)

## 🚀 Deployment

### Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables for Production

Update `.env` for production:

```env
VITE_API_BASE_URL=https://api.sharplook.com/api/v1
```

### Hosting

Deploy the `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 📄 License

Private - SharpLook Platform

## 🤝 Support

For issues or questions, contact the development team.

---

Built with ❤️ for SharpLook
