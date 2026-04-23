# FinX - Financial Household Management System

A comprehensive web application for managing household financial data, tracking net worth, and generating actionable financial insights through Excel data uploads.

## 📋 Overview

FinX is a full-stack application designed to help households and financial advisors analyze financial data efficiently. Users can upload Excel spreadsheets containing financial information, which the system processes and presents through an intuitive dashboard with visualizations and analytics.

## ✨ Features

- **Excel Upload**: Upload household financial data from .xlsx and .xls files
- **Household Management**: Create, view, and manage multiple households
- **Member Tracking**: Track household members and their associated financial information
- **Financial Profiles**: Store and analyze individual financial profiles
- **Bank Details**: Manage bank account and financial account information
- **Insights Dashboard**: View aggregated financial analytics and visualizations
- **Net Worth Tracking**: Automatic calculation and monitoring of total household net worth
- **Dark/Light Theme**: Toggle between dark and light mode for comfortable viewing
- **Responsive Design**: Fully responsive UI that works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy ORM with SQL database
- **Data Processing**: Pandas, OpenPyxl
- **Authentication**: Passlib with Bcrypt
- **AI Integration**: LangChain with OpenAI API
- **Server**: Uvicorn
- **API Documentation**: Auto-generated FastAPI docs

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: CSS with CSS Variables
- **Charting**: Recharts for data visualization
- **Linting**: ESLint

## 📁 Project Structure

```
Assignment/
├── backend/
│   ├── config.py              # Configuration and settings
│   ├── database.py            # Database initialization and connection
│   ├── main.py                # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── models/                # SQLAlchemy models
│   │   ├── bank_detail.py
│   │   ├── financial_profile.py
│   │   ├── household.py
│   │   └── household_member.py
│   ├── routes/                # API endpoints
│   │   ├── excel_sheet.py    # Excel upload and processing
│   │   ├── household.py       # Household management
│   │   └── insights.py        # Analytics and insights
│   ├── schemas/               # Pydantic models for request/response validation
│   │   ├── bank_detail.py
│   │   ├── financial_account.py
│   │   ├── household.py
│   │   ├── household_member.py
│   │   └── user.py
│   └── services/              # Business logic
│       ├── household_service.py
│       └── sheet_service.py
│
└── frontend/
    ├── package.json           # Node dependencies
    ├── tsconfig.json          # TypeScript configuration
    ├── vite.config.ts         # Vite build configuration
    ├── eslint.config.js       # ESLint configuration
    ├── index.html             # HTML entry point
    └── src/
        ├── main.tsx           # React entry point
        ├── App.tsx            # Main app component with routing
        ├── App.css            # Global styles
        ├── index.css          # Global CSS variables
        ├── components/        # Reusable components
        │   ├── Sidebar.tsx    # Navigation sidebar
        │   └── animatedBackground/
        │       └── DotField.tsx
        ├── hooks/             # Custom React hooks
        │   ├── useTheme.ts    # Theme hook
        │   ├── ThemeProvider.tsx
        │   └── ThemeContext.ts
        ├── pages/             # Page components
        │   ├── Dashboard.tsx  # Main dashboard layout
        │   ├── HouseholdList.tsx
        │   ├── HouseholdDetail.tsx
        │   ├── Insights.tsx   # Analytics and insights page
        │   └── UploadScreen.tsx
        ├── assets/            # Static assets
        └── public/            # Public files
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```
   DEBUG=True
   DATABASE_URL=sqlite:///./financial_data.db
   OPENAI_API_KEY=your_api_key_here
   ```

5. **Run the backend server**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://demo.mandlix.com`
   API documentation: `http://demo.mandlix.com/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

## 📡 API Endpoints

### Excel Sheet Operations
- `POST /api/excel/upload` - Upload an Excel file
- `GET /api/excel/list` - List all households
- `GET /api/excel/{id}` - Get specific household details
- `GET /api/excel/insights/data` - Get financial insights and summary

### Household Management
- `GET /api/household/` - List all households
- `GET /api/household/{id}` - Get household details
- `POST /api/household/` - Create a new household
- `PUT /api/household/{id}` - Update household information
- `DELETE /api/household/{id}` - Delete a household

### Insights
- `GET /api/insights/` - Get aggregated financial insights
- `GET /api/insights/net-worth` - Get total net worth calculations
- `GET /api/insights/trends` - Get financial trends

## 🗄️ Database Models

### Household
- `id`: Primary key
- `name`: Household name
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- Relations: members, financial_profiles, bank_details

### HouseholdMember
- `id`: Primary key
- `household_id`: Foreign key
- Member personal information
- Relations: household, financial_profiles

### FinancialProfile
- `id`: Primary key
- `household_id`: Foreign key
- Income and expense information
- Relations: household, member

### BankDetail
- `id`: Primary key
- `household_id`: Foreign key
- Bank account and financial account details
- Relations: household

## 🎨 Frontend Pages

### Upload Screen (`/`)
- Landing page with project overview
- Excel file upload interface
- Quick statistics display (households, members, accounts, net worth)
- Navigation to dashboard

### Dashboard (`/dashboard`)
- Main application hub
- Navigation sidebar with theme toggle
- Nested routing for child pages

### Household List (`/dashboard/households`)
- Display all households in tabular format
- Search and filter capabilities
- Create new household option
- Quick actions (view, edit, delete)

### Household Detail (`/dashboard/household/:id`)
- Detailed view of a single household
- Member list and information
- Associated financial accounts
- Net worth breakdown

### Insights (`/dashboard/insights`)
- Financial analytics and visualizations
- Charts for income, expenses, net worth trends
- Aggregated household statistics
- Comparative analysis

## 🔧 Configuration

### Backend Configuration (config.py)
- `app_name`: Application name
- `debug`: Debug mode flag
- `database_url`: Database connection string
- `openai_api_key`: OpenAI API key for AI features

### Frontend Configuration
- Theme configuration in `hooks/ThemeContext.ts`
- API base URL in service files
- CSS variables in `index.css`

## 📊 Data Flow

1. **Upload**: User uploads Excel file through UploadScreen
2. **Parse**: Backend parses Excel data using pandas
3. **Validate**: Data validated against Pydantic schemas
4. **Store**: Data stored in database using SQLAlchemy
5. **Display**: Frontend fetches data and displays in Dashboard
6. **Analyze**: Analytics calculated and displayed in Insights page

## 🎯 Key Features Explained

### Excel Upload Processing
- Accepts .xlsx and .xls files
- Automatically parses household, member, and financial data
- Validates data integrity
- Stores in structured database format

### Financial Insights
- Automatic calculation of total net worth
- Income and expense analysis
- Household comparison metrics
- Trend analysis over time

### Theme System
- Dark/Light mode toggle
- Persisted user preference
- System preference detection
- Smooth transitions

## 🔐 Security Considerations

- CORS enabled for API access
- Password hashing with bcrypt
- Environment variable configuration for sensitive data
- Input validation using Pydantic schemas
- SQL injection prevention through ORM

## 📝 Environment Variables

### Backend (.env)
```
DEBUG=True
DATABASE_URL=sqlite:///./financial_data.db
OPENAI_API_KEY=your_key
APP_NAME=FinX
```

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure Uvicorn is running on port 8000
- Check CORS settings in main.py
- Verify database connection string

### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check Node.js version compatibility

### Excel Upload Errors
- Verify file format (.xlsx or .xls)
- Check file size limitations
- Ensure required columns are present in Excel

## 📈 Future Enhancements

- User authentication and multi-user support
- Advanced financial analytics and ML predictions
- Export reports to PDF
- Mobile app version
- Real-time data sync
- Budget planning features
- Financial goal tracking

## 📄 License

This project is provided as-is for educational and development purposes.

## 👥 Support

For issues, questions, or contributions, please refer to the project documentation or contact the development team.

---

**Last Updated**: April 2026
**Version**: 1.0.0
