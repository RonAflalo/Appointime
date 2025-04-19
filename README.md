# Appointime - Appointment Scheduling System

Appointime is a modern, full-stack appointment scheduling system built with React, TypeScript, and Node.js. It provides a seamless experience for both business owners and customers to manage appointments, services, and business operations.

## Features

- **User Authentication**
  - Secure login and registration
  - Role-based access control (Admin/Customer)
  - Business registration and management

- **Appointment Management**
  - Real-time calendar view
  - Appointment booking system
  - Pending appointments management
  - Appointment history

- **Business Features**
  - Service management
  - Customer database
  - Business settings and customization
  - Statistics and analytics
  - Review management

- **Mobile Responsive**
  - Optimized for all devices
  - RTL (Right-to-Left) support
  - Touch-friendly interface

## Tech Stack

- **Frontend**
  - React + TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - React Router for navigation
  - Framer Motion for animations

- **Backend**
  - Node.js + Express
  - TypeScript
  - Prisma ORM
  - PostgreSQL database
  - JWT authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/appointime.git
cd appointime
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/appointime"
JWT_SECRET=your_jwt_secret
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
```

5. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

## Project Structure

```
appointime/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── api/       # API client functions
│   │   ├── components/# Reusable UI components
│   │   ├── contexts/  # React contexts
│   │   ├── pages/     # Page components
│   │   └── utils/     # Utility functions
│   └── public/        # Static assets
│
└── backend/           # Node.js backend application
    ├── src/
    │   ├── routes/    # API routes
    │   ├── models/    # Database models
    │   ├── middleware/# Express middleware
    │   └── utils/     # Utility functions
    └── prisma/        # Prisma schema and migrations
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
