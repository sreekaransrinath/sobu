# Budget Dashboard 📊

A responsive Next.js dashboard for tracking personal finances and visualizing spending trends using data stored in Google Sheets.

![Budget Dashboard](public/dashboard-preview.png)

## Features

- **Google Sheets Integration**: Connect directly to your financial data in Google Sheets
- **Spending Visualization**: 
  - Line chart showing daily, fixed, and total spending trends
  - Donut chart for spending by category
  - Bar chart comparing actual spending to budget
- **Needs vs. Wants Analysis**: Visual breakdown of necessary vs. discretionary spending
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Customizable Time Periods**: Filter data by day, week, or month
- **Transaction Table**: Searchable and filterable transaction list

## Getting Started

### Prerequisites

- Node.js 16.x or later
- Google Sheets API key
- Google Sheet with your financial data

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/budget-dashboard.git
   cd budget-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Create a `.env` file based on the example:
   ```
   cp .env.EXAMPLE .env
   ```

4. Configure your environment variables (see Configuration section)

5. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard

## Configuration

### Google Sheets Setup

1. Create a Google Sheet with your financial data. The sheet should include columns for:
   - Date
   - Amount
   - Category
   - Description
   - Type (optional, for distinguishing between needs and wants)

2. Get your Google Sheets API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to APIs & Services > Library
   - Enable the Google Sheets API
   - Create credentials (API key)
   - Restrict the API key to only Google Sheets API and your domains for security

3. Update your `.env` file with:
   ```
   NEXT_PUBLIC_GSHEETS_API_KEY=your_api_key_here
   NEXT_PUBLIC_SHEET_ID=your_sheet_id_here
   NEXT_PUBLIC_SHEET_RANGE=Sheet1!A1:E100
   ```
   
   The Sheet ID can be found in your Google Sheet URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GSHEETS_API_KEY` | Your Google Sheets API key | `AIzaSyA...` |
| `NEXT_PUBLIC_SHEET_ID` | ID of your Google Sheet | `1BxiMVs0XRA...` |
| `NEXT_PUBLIC_SHEET_RANGE` | Range of cells to fetch | `Sheet1!A1:E100` |

## Data Structure

Your Google Sheet should follow this structure:

| Date | Amount | Category | Description | Type |
|------|--------|----------|-------------|------|
| 2023-01-01 | 25.00 | Groceries | Whole Foods | Need |
| 2023-01-02 | 15.50 | Entertainment | Movie tickets | Want |

## Development

This project uses:
- [Next.js](https://nextjs.org/) - React framework
- [Recharts](https://recharts.org/) - Charting library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety

### Folder Structure

```
/
├── app/                   # Next.js app router
├── components/            # React components
│   ├── ChartLineDaily.tsx # Daily spending line chart
│   ├── ChartDonutCat.tsx  # Category spending donut chart
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helper functions
├── public/                # Static assets
└── state/                 # Application state management
```

## Security Considerations

- The Google Sheets API key used in this application is a public client-side key
- For security:
  - Restrict your API key to specific domains in Google Cloud Console
  - Only share your financial data in a Sheet you control
  - Do not include sensitive personal information in your Sheet

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Recharts](https://recharts.org/) for the powerful charting library
- [TailwindUI](https://tailwindui.com/) for design inspiration
- [Google Sheets API](https://developers.google.com/sheets/api) for data storage
