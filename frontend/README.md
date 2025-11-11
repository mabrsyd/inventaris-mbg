# Project Overview

This project is a web application built using Next.js that integrates with a backend service for managing inventory, procurement, production, and distribution processes. The application provides a user-friendly interface for users to interact with various functionalities related to master data, inventory management, procurement, production workflows, and reporting.

## Features

- **Authentication**: Users can log in and register to access the application.
- **Dashboard**: A central hub for navigating through different sections of the application.
- **Master Data Management**: Users can manage categories, locations, and suppliers.
- **Inventory Management**: Users can view and manage inventory items and stock levels.
- **Procurement Management**: Users can handle purchase orders and goods receipts.
- **Production Management**: Users can manage recipes and work orders.
- **Distribution Management**: Users can manage beneficiaries and delivery orders.
- **Reporting**: Users can generate reports for stock, expiry, and audit logs.

## Project Structure

- **app/**: Contains the main application files, including pages and layout components.
- **components/**: Contains reusable UI components, forms, and tables.
- **lib/**: Contains API client setup, hooks, types, and validation logic.
- **public/**: Contains static assets for the application.
- **.env.local**: Environment variables for local development.
- **README.md**: Documentation for the project.

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up environment variables**:
   Copy the `.env.example` to `.env.local` and update the values as needed.

4. **Run the application**:
   ```
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.