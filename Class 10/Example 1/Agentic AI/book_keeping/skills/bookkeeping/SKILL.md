# Bookkeeping Skill

## Description

Enables the agent to parse, categorize, and track financial transactions (income, expenses, and receipts), summarize spending, generate reports, and flag anomalies.

## Capabilities

### 1. Income Management

- **Record income**: Create income entries with amount, description, source, date, and optional notes.
- **List/query income**: Retrieve income filtered by date range or source.
- **Summarize income**: Aggregate income by source over a given period, returning totals and counts.

### 2. Expense Management

- **Record expenses**: Create expense entries with amount, description, category, date, and optional notes.
- **Categorize spending**: Assign expenses to user-defined categories (e.g., Office Supplies, Travel, Utilities).
- **List/query expenses**: Retrieve expenses filtered by category, date range, or search term.
- **Update/delete expenses**: Modify or remove expense records.
- **Summarize spending**: Aggregate expenses by category over a given period, returning totals and counts.

### 3. Receipt Handling

- **Upload receipts**: Accept image (JPEG, PNG, WebP) or PDF files up to 10 MB.
- **Parse receipt data**: Extract amount, date, vendor, and line items via LLM (OpenRouter).
- **Link receipts to expenses**: Attach a receipt to an expense record for audit trail.
- **Print receipts**: Print or save receipt details as PDF via browser print.

### 4. Reports & Analytics

- **Income vs Expense summary**: Compare total income against total expenses over a date range.
- **Net income calculation**: View surplus or deficit for any period.
- **Expense breakdown by category**: See which categories drive spending.
- **Income breakdown by source**: Understand where money comes from.
- **Printable reports**: Export summary reports via browser print.

### 5. Conversational AI (Ledger)

- **Natural language entry**: Add income or expenses by chatting with the agent.
- **Smart extraction**: Agent extracts amount, description, category/source, and date from plain text.
- **Session history**: Conversations persisted across page reloads.

### 6. Anomaly Detection

- **Flag unusual spending**: Compare expense amounts against category averages and alert on outliers.
- **Duplicate detection**: Identify expenses with matching amounts and close dates that may be duplicates.

## Data Model

Refer to `prisma/schema.prisma` for the canonical schema. Key entities:

- **Income**: amount (Decimal), description, source, date, notes.
- **Expense**: amount (Decimal), description, date, category, receipt link, notes.
- **Category**: name, color, icon.
- **Receipt**: filename, MIME type, size, storage path, status (PENDING/PARSED/FAILED), parsed JSON data.
- **AgentMemory**: key-value store for agent persistence across sessions.
- **Session**: conversation history with messages as JSON array.

## Dashboard

The dashboard displays:

- **5 stat cards**: Total Income, Total Spending, Net Income, Avg/Transaction, Top Category
- **Income vs Expense bar chart** (monthly aggregation)
- **Category donut chart** (expense breakdown)
- **Recent expenses** list

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/income` | List / create income |
| GET/POST | `/api/expenses` | List / create expenses |
| GET/PUT/DELETE | `/api/expenses/[id]` | Single expense CRUD |
| GET/POST | `/api/categories` | List / create categories |
| GET/PUT/DELETE | `/api/categories/[id]` | Single category CRUD |
| GET/POST | `/api/receipts` | List / upload receipts |
| GET | `/api/receipts/[id]` | Receipt detail |
| POST | `/api/chat` | Conversational agent |
| GET | `/api/sessions` | Chat session history |
| GET | `/api/health` | System health check |

## Dependencies

- `openai` SDK (configured for OpenRouter API)
- `@prisma/client` for database access
- `zod` for input validation
- `recharts` for dashboard charts
