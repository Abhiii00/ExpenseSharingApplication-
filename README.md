# Smart Expense Sharing Application

This project is a MERN-based expense sharing app inspired by Splitwise. The current version focuses on a simple expense-only flow with clean controller/service separation so it is easier to understand, explain, and extend.

## Folder Structure

```text
expenseSharing/
  backend/
    src/
      config/
      controllers/
      middlewares/
      models/
      routes/
      services/
      utils/
  Frontend/
    src/
      component/
      coreFIles/
```

## Features

- Create expense
- View all expenses
- Delete expense
- Create and manage users
- View balances
- View optimized settlements
- Equal split and unequal split
- Input validation for payer, participants, and share totals
- Soft delete for expenses using `isDeleted`

## Backend Overview

- `controllers/expenseController.js`
  Handles request/response flow for expenses.
- `controllers/userController.js`
  Handles request/response flow for users.
- `models/expenseModel.js`
  Stores expense data in MongoDB.
- `models/userModel.js`
  Stores user data in MongoDB.
- `services/expenseService.js`
  Contains expense validation, formatting, create/list/delete logic, and balance/settlement data preparation.
- `services/userService.js`
  Contains user create/list/update logic.
- `utils/settlementHelpers.js`
  Contains balance and optimized settlement logic.
- `utils/msgResponse.js`
  Centralized API response messages.
- `utils/responseHelper.js`
  Shared success/error response helpers.
- `routes/route.js`
  Defines all API endpoints.

## Frontend Overview

- `component/`
  Contains the main UI sections like user manager, expense form, balances, settlements, and expense list.
- `coreFIles/config.js`
  Axios configuration.
- `coreFIles/helper.js`
  API calling helper methods.

## API Endpoints

- `GET /api/health`
- `POST /api/users`
- `GET /api/users`
- `PATCH /api/users/:id/status`
- `POST /api/expenses`
- `GET /api/expenses`
- `DELETE /api/expenses/:id`
- `GET /api/balances`
- `GET /api/settlements`

## Environment Variables

### `backend/.env`

```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.6itwk6b.mongodb.net/smart-expense-sharing
CLIENT_URL=http://localhost:5173
```

### `Frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:5173`.

## Settlement Logic

- First calculate each user's net balance.
- Positive balance means that person should receive money.
- Negative balance means that person needs to pay.
- Then reduce transactions by matching debtors and creditors into the smallest set of payments.
