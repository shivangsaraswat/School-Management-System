# School Management System

A comprehensive, industrial-grade school management system built with Next.js 15, designed to handle 10,000+ students with role-based access control and modern UI/UX.

## 🚀 Features

### Role-Based Access Control (RBAC)
- **Super Admin**: Full system access, revenue viewing, staff permission management
- **Admin**: School operations and academic management
- **Office Staff**: Student admissions, fees, and records (revenue access controlled by Super Admin)
- **Teacher**: Class management, attendance, and grade entry for assigned classes only
- **Student**: View personal results and academic information

### Core Modules
- **Student Management**: Complete student lifecycle from admission to graduation
- **Class Management**: Flexible class and section configuration (Nursery to Class 12)
- **Fee Management**: Track payments, generate receipts, manage fee structures
- **Attendance System**: Daily attendance tracking with reports
- **Examination & Results**: Grade management and result generation
- **User Management**: Role-based user accounts with granular permissions

### UI/UX Highlights
- Modern, responsive dashboard with collapsible sidebar
- Professional typography optimized for readability
- Dark mode support
- Mobile-first responsive design
- Smooth animations and transitions
- Accessible components using Radix UI

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Neon Postgres](https://neon.tech/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)
- **Password Hashing**: bcryptjs
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd school-management-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your actual values:

```env
# Database
DATABASE_URL="your-neon-postgres-connection-string"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Optional: Backblaze B2 (for file storage)
BACKBLAZE_KEY_ID="your-key-id"
BACKBLAZE_APPLICATION_KEY="your-application-key"
BACKBLAZE_BUCKET_NAME="your-bucket-name"
BACKBLAZE_BUCKET_ID="your-bucket-id"
```

### 4. Set up the database

Push the database schema:

```bash
npm run db:push
```

Seed the database with test data:

```bash
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Default Test Accounts

After seeding, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@school.com | admin123 |
| Admin | principal@school.com | admin123 |
| Office Staff | office@school.com | admin123 |
| Teacher | teacher@school.com | admin123 |
| Student | student@school.com | admin123 |

**⚠️ Important**: Change these passwords in production!

## 📁 Project Structure

```
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard pages
│   │   ├── admin/           # Super admin pages
│   │   ├── operations/      # Operations pages (students, fees, etc.)
│   │   ├── academics/       # Academic pages (attendance, exams)
│   │   └── student/         # Student portal pages
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── dashboard/           # Dashboard-specific components
├── db/                      # Database configuration
│   ├── schema.ts            # Drizzle schema
│   └── seed.ts              # Database seeding
├── lib/                     # Utility functions
│   ├── auth.ts              # NextAuth configuration
│   ├── dal.ts               # Data access layer
│   ├── permissions.ts       # RBAC permissions
│   └── constants.ts         # App constants
└── public/                  # Static assets
```

## 🔐 Security Features

- Password hashing with bcryptjs
- Session-based authentication with NextAuth.js
- Role-based access control (RBAC)
- Server-side route protection
- Environment variable protection
- SQL injection prevention with Drizzle ORM

## 🎨 Customization

### Changing Theme Colors

Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... other colors */
}
```

### Adding New Roles

1. Update `lib/constants.ts` to add new role
2. Update `db/schema.ts` to add role to enum
3. Update `lib/permissions.ts` to define permissions
4. Run `npm run db:push` to update database

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open Drizzle Studio

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to:
- Netlify
- Railway
- AWS
- Google Cloud
- Any Node.js hosting

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email your-email@example.com or open an issue on GitHub.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Neon](https://neon.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NextAuth.js](https://next-auth.js.org/)
