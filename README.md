# Invoice Generator

A modern, feature-rich invoice generator built with React 19.2, TypeScript, and Material-UI 7.3.4. Create professional invoices with ease and download them as PDF.

## Features

- **Modern Tech Stack**: Built with React 19.2, TypeScript, Material-UI 7.3.4, and React Router DOM 7.9.4
- **Real-time Preview**: See your invoice update in real-time as you fill in the details
- **PDF Export**: Download invoices as professionally formatted PDF documents
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: Automatically saves your invoice data locally
- **Comprehensive Fields**:
  - Company information (From/Bill To)
  - Invoice number with auto-generation
  - Customizable dates (Invoice Date & Due Date)
  - Multiple line items with quantity and rate
  - Tax, discount, and shipping calculations
  - Multiple currency support
  - Notes and terms & conditions

## Tech Stack

- **React**: 19.0.0
- **TypeScript**: 5.7.2
- **Material-UI**: 7.3.4
- **React Router DOM**: 7.9.4
- **Vite**: 6.0.5
- **html2pdf.js**: 0.10.2
- **date-fns**: 4.1.0

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/daorbit/invoice-generator.git
cd invoice-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Usage

1. **Fill in Company Details**: Enter your company information in the "From" section
2. **Add Client Information**: Fill in your client's details in the "Bill To" section
3. **Set Invoice Details**: Configure invoice number, dates, currency, tax, and shipping
4. **Add Line Items**: Add products or services with description, quantity, and rate
5. **Add Notes**: Include any additional notes or payment terms
6. **Download**: Click "Download PDF" to generate and download your invoice

## Project Structure

```
invoice-generator/
├── src/
│   ├── components/
│   │   ├── InvoiceForm/
│   │   │   ├── CompanyInfoForm.tsx
│   │   │   ├── InvoiceDetailsForm.tsx
│   │   │   ├── InvoiceItemsForm.tsx
│   │   │   └── AdditionalInfoForm.tsx
│   │   ├── InvoicePreview/
│   │   │   └── InvoicePreview.tsx
│   │   └── Layout/
│   │       └── Layout.tsx
│   ├── context/
│   │   └── InvoiceContext.tsx
│   ├── pages/
│   │   └── InvoiceGenerator.tsx
│   ├── types/
│   │   └── invoice.ts
│   ├── utils/
│   │   ├── invoiceUtils.ts
│   │   └── storage.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Features in Detail

### Invoice Calculations
- Automatic subtotal calculation from line items
- Percentage-based tax calculation
- Percentage-based discount calculation
- Fixed shipping cost addition
- Real-time total updates

### Currency Support
Supports multiple currencies:
- USD ($)
- EUR (€)
- GBP (£)
- INR (₹)
- JPY (¥)
- AUD (A$)
- CAD (C$)

### Data Persistence
- Automatically saves invoice data to browser's local storage
- Data persists across browser sessions
- Reset functionality to clear all data

## License

MIT

## Author

DAOrbit

## Acknowledgments

- Inspired by [invoice-generator.com](https://invoice-generator.com/)
- Built with [Material-UI](https://mui.com/)
- Powered by [Vite](https://vitejs.dev/)