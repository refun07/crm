# Klassy Missy - Telesales CRM System

A comprehensive Laravel + React CRM system built for managing large-scale telesales operations with lead management, call tracking, follow-ups, order conversion, and commission calculation.

## 🚀 Features

### Core Functionality
- ✅ **Lead Management** - Import, assign, and track thousands of leads
- ✅ **Call Logging** - Track all call activities with outcomes and notes
- ✅ **Follow-up System** - Smart scheduling with priority levels
- ✅ **Order Conversion** - Convert leads to orders with commission tracking
- ✅ **Commission Management** - Flexible commission rules (fixed, percentage, hybrid)
- ✅ **Role-Based Access Control** - Super Admin, Manager, Agent, and Auditor roles
- ✅ **Activity Logging** - Complete audit trail of all actions
- ✅ **Dashboard Analytics** - Real-time stats and leaderboards

### Security Features
- 🔒 **Phone Number Encryption** - All phone numbers encrypted at rest
- 🔒 **Role-Based Permissions** - Granular access control using Spatie Permission
- 🔒 **Activity Logging** - IP and user agent tracking
- 🔒 **Data Export Prevention** - Agents cannot bulk export data
- 🔒 **Daily Lead Limits** - Configurable per-agent limits

### Admin Features
- 📊 **Excel/CSV Import** - Bulk lead upload with duplicate detection
- 📊 **Auto Lead Distribution** - Automatic daily assignment to agents
- 📊 **Lead Recycling** - Unworked leads return to pool
- 📊 **Performance Reports** - Agent-wise analytics and conversion tracking
- 📊 **Commission Configuration** - Flexible commission rule management

## 📋 Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL/PostgreSQL database
- Redis (optional, for queues)

## 🛠️ Installation

### 1. Clone and Install Dependencies

\`\`\`bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
\`\`\`

### 2. Environment Configuration

\`\`\`bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
\`\`\`

### 3. Database Configuration

Update your `.env` file with database credentials:

\`\`\`env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=klassy_missy_crm
DB_USERNAME=your_username
DB_PASSWORD=your_password
\`\`\`

### 4. External API Configuration (Optional)

For syncing orders to the main Klassy Missy website:

\`\`\`env
KLASSY_MISSY_API_URL=https://klassymissy.com
KLASSY_MISSY_API_KEY=your_api_key_here
\`\`\`

### 5. Run Migrations and Seeders

\`\`\`bash
# Run migrations
php artisan migrate

# Seed database with roles, permissions, and sample users
php artisan db:seed
\`\`\`

### 6. Build Frontend Assets

\`\`\`bash
# Development
npm run dev

# Production
npm run build
\`\`\`

### 7. Start the Application

\`\`\`bash
# Start Laravel server
php artisan serve

# In another terminal, start Vite dev server
npm run dev
\`\`\`

Visit `http://localhost:8000` in your browser.

## 👥 Default Users

After seeding, you can login with these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@klassymissy.com | password |
| Manager | manager@klassymissy.com | password |
| Agent 1-5 | agent1@klassymissy.com | password |

## 📁 Project Structure

\`\`\`
app/
├── Http/Controllers/
│   ├── Api/                    # API controllers
│   │   ├── CallLogController.php
│   │   ├── DashboardController.php
│   │   ├── FollowUpController.php
│   │   └── OrderController.php
│   ├── Admin/                  # Admin controllers
│   │   ├── ImportController.php
│   │   └── LeadAssignmentController.php
│   └── LeadController.php      # Main lead controller
├── Models/
│   ├── Lead.php               # Lead model with encryption
│   ├── CallLog.php
│   ├── FollowUp.php
│   ├── Order.php
│   ├── Commission.php
│   ├── LeadAssignment.php
│   ├── ImportBatch.php
│   └── CommissionRule.php
database/
├── migrations/                 # All database migrations
└── seeders/
    ├── RolePermissionSeeder.php
    └── CommissionRuleSeeder.php
resources/
└── js/
    └── Pages/
        ├── Dashboard.tsx       # Agent dashboard
        └── Leads/
            └── Index.tsx       # Leads listing
routes/
├── api.php                     # API routes
└── web.php                     # Web routes
\`\`\`

## 🔌 API Endpoints

### Authentication
All API endpoints require authentication using Sanctum.

### Agent Endpoints

\`\`\`
GET    /api/dashboard/agent           # Agent dashboard stats
GET    /api/leads                     # List assigned leads
GET    /api/leads/todays              # Today's assignments
GET    /api/leads/{id}                # Lead details
PATCH  /api/leads/{id}                # Update lead
POST   /api/leads/{id}/lock           # Lock lead after call

POST   /api/call-logs                 # Log a call
GET    /api/call-logs/{leadId}        # Get call history

GET    /api/follow-ups                # List follow-ups
POST   /api/follow-ups                # Create follow-up
POST   /api/follow-ups/{id}/claim     # Claim follow-up
POST   /api/follow-ups/{id}/complete  # Complete follow-up

GET    /api/orders                    # List orders
POST   /api/orders                    # Create order (convert lead)
\`\`\`

### Admin Endpoints

\`\`\`
GET    /api/dashboard/admin                      # Admin dashboard
GET    /api/admin/imports                        # List imports
POST   /api/admin/imports/upload                 # Upload Excel/CSV
GET    /api/admin/imports/{id}                   # Import details
GET    /api/admin/imports/{id}/errors            # Download errors

POST   /api/admin/assignments/auto-distribute    # Auto-assign leads
POST   /api/admin/assignments/manual-assign      # Manual assignment
POST   /api/admin/assignments/recycle            # Recycle unworked leads
GET    /api/admin/assignments/stats              # Assignment stats
\`\`\`

## 📊 Database Schema

### Key Tables

- **users** - System users with roles
- **leads** - Customer leads (encrypted phone numbers)
- **lead_assignments** - Daily lead assignments to agents
- **call_logs** - Call activity tracking
- **follow_ups** - Follow-up scheduling
- **orders** - Converted orders
- **commissions** - Agent commissions
- **import_batches** - Excel import tracking
- **activity_logs** - Audit trail

## 🎯 Usage Guide

### For Agents

1. **Login** - Use your agent credentials
2. **View Dashboard** - See today's assignments and stats
3. **Work Leads** - Access leads from "My Leads" page
4. **Log Calls** - Record call outcomes and notes
5. **Schedule Follow-ups** - Set reminders for callbacks
6. **Convert Orders** - Submit orders when leads convert
7. **Track Commission** - View earnings on dashboard

### For Managers

1. **Monitor Performance** - View agent stats and leaderboards
2. **Assign Leads** - Manually assign specific leads
3. **Review Reports** - Access conversion analytics
4. **Manage Follow-ups** - Oversee follow-up queue

### For Super Admin

1. **Import Leads** - Upload Excel/CSV files
2. **Auto-Distribute** - Run automatic lead assignment
3. **Configure Limits** - Set daily lead limits per agent
4. **Manage Users** - Create/edit user accounts
5. **Set Commission Rules** - Configure commission calculations

## 🔧 Configuration

### Commission Rules

Edit commission rules in the database or create a UI:

\`\`\`php
CommissionRule::create([
    'name' => 'Standard Commission',
    'type' => 'percentage',  // 'fixed', 'percentage', or 'hybrid'
    'percentage_value' => 5.00,
    'is_active' => true,
    'is_default' => true,
]);
\`\`\`

### Daily Lead Limits

Update user's daily limit:

\`\`\`php
$user->update(['daily_lead_limit' => 300]);
\`\`\`

## 🚀 Deployment

### Production Build

\`\`\`bash
# Build assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force
\`\`\`

### Queue Workers (Recommended)

For processing imports in background:

\`\`\`bash
php artisan queue:work --tries=3
\`\`\`

## 📝 Excel Import Format

Your Excel/CSV file should have these columns:

| Column | Required | Description |
|--------|----------|-------------|
| Name | Yes | Customer name |
| Email | No | Email address |
| Phone | Yes | Phone number |
| Address | No | Street address |
| City | No | City |
| State | No | State/Province |
| Zip Code | No | Postal code |
| Source | No | Lead source |

## 🔐 Security Best Practices

1. **Change Default Passwords** - Update all default user passwords
2. **Enable HTTPS** - Use SSL in production
3. **Configure CORS** - Restrict API access
4. **Rate Limiting** - Enable API rate limits
5. **Regular Backups** - Backup database regularly
6. **Monitor Logs** - Review activity logs for suspicious activity

## 🐛 Troubleshooting

### Migration Errors
\`\`\`bash
php artisan migrate:fresh --seed
\`\`\`

### Permission Issues
\`\`\`bash
php artisan permission:cache-reset
\`\`\`

### Asset Build Errors
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
npm run build
\`\`\`

## 📞 Support

For issues or questions, please contact the development team.

## 📄 License

Proprietary - All rights reserved by Klassy Missy

---

Built with ❤️ using Laravel 12, React 18, and Inertia.js
