export interface DemoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tier: 'Standard' | 'Premium' | 'Business';
  kycStatus: 'Verified' | 'Pending' | 'Not Started';
  lastLogin: string;
  memberSince: string;
}

export interface Account {
  id: string;
  type: 'checking' | 'savings' | 'business';
  name: string;
  accountNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'transfer' | 'withdraw' | 'payment' | 'salary' | 'shopping' | 'groceries' | 'utilities' | 'atm';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
  fromAccount?: string;
  toAccount?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bank: string;
  avatar: string;
}

export interface Statement {
  id: string;
  month: string;
  year: number;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
}

export interface VirtualCard {
  id: string;
  nickname: string;
  brand: 'Visa' | 'Mastercard';
  cardholderName: string;
  pan: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  currency: string;
  status: 'active' | 'frozen';
  monthlyLimit: number;
  spentThisMonth: number;
  linkedAccountId: string;
}

export const demoUser: DemoUser = {
  id: 'usr_001',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+49 170 123 4567',
  avatar: 'AJ',
  tier: 'Premium',
  kycStatus: 'Verified',
  lastLogin: new Date().toISOString(),
  memberSince: '2022-03-15',
};

export const demoVirtualCards: VirtualCard[] = [
  {
    id: 'vcard_001',
    nickname: 'Online Shopping',
    brand: 'Visa',
    cardholderName: 'Alex Johnson',
    pan: '4111 1111 1111 1234',
    cvv: '482',
    expiryMonth: '09',
    expiryYear: '28',
    currency: 'USD',
    status: 'active',
    monthlyLimit: 2500,
    spentThisMonth: 684.23,
    linkedAccountId: 'acc_001',
  },
];

export const demoAccounts: Account[] = [
  {
    id: 'acc_001',
    type: 'checking',
    name: 'Checking Account',
    accountNumber: 'DE89 3704 0044 0532 0130 00',
    balance: 12847.52,
    availableBalance: 12347.52,
    currency: 'USD',
  },
  {
    id: 'acc_002',
    type: 'savings',
    name: 'Savings Account',
    accountNumber: 'DE89 3704 0044 0532 0130 01',
    balance: 45230.00,
    availableBalance: 45230.00,
    currency: 'USD',
  },
  {
    id: 'acc_003',
    type: 'business',
    name: 'Business Account',
    accountNumber: 'DE89 3704 0044 0532 0130 02',
    balance: 89156.78,
    availableBalance: 87156.78,
    currency: 'USD',
  },
];

export const demoTransactions: Transaction[] = [
  { id: 'txn_001', type: 'salary', description: 'Monthly Salary - TechCorp GmbH', amount: 4500.00, date: '2024-01-15', status: 'completed', category: 'Income' },
  { id: 'txn_002', type: 'shopping', description: 'Amazon.de Purchase', amount: -89.99, date: '2024-01-14', status: 'completed', category: 'Shopping' },
  { id: 'txn_003', type: 'transfer', description: 'Transfer to Sarah M.', amount: -250.00, date: '2024-01-13', status: 'completed', category: 'Transfer' },
  { id: 'txn_004', type: 'groceries', description: 'REWE Supermarket', amount: -67.34, date: '2024-01-12', status: 'completed', category: 'Groceries' },
  { id: 'txn_005', type: 'utilities', description: 'Vodafone Monthly', amount: -49.99, date: '2024-01-11', status: 'completed', category: 'Bills' },
  { id: 'txn_006', type: 'atm', description: 'ATM Withdrawal - Berlin Hbf', amount: -200.00, date: '2024-01-10', status: 'completed', category: 'Cash' },
  { id: 'txn_007', type: 'deposit', description: 'Cash Deposit', amount: 500.00, date: '2024-01-09', status: 'completed', category: 'Deposit' },
  { id: 'txn_008', type: 'shopping', description: 'Zalando Fashion', amount: -156.78, date: '2024-01-08', status: 'completed', category: 'Shopping' },
  { id: 'txn_009', type: 'utilities', description: 'Netflix Subscription', amount: -12.99, date: '2024-01-07', status: 'completed', category: 'Entertainment' },
  { id: 'txn_010', type: 'groceries', description: 'Lidl Store', amount: -45.23, date: '2024-01-06', status: 'completed', category: 'Groceries' },
  { id: 'txn_011', type: 'transfer', description: 'Rent Payment - Hans Müller', amount: -950.00, date: '2024-01-05', status: 'completed', category: 'Housing' },
  { id: 'txn_012', type: 'shopping', description: 'MediaMarkt Electronics', amount: -299.00, date: '2024-01-04', status: 'pending', category: 'Electronics' },
  { id: 'txn_013', type: 'utilities', description: 'Electricity Bill - EnBW', amount: -87.45, date: '2024-01-03', status: 'completed', category: 'Bills' },
  { id: 'txn_014', type: 'deposit', description: 'Refund - Online Store', amount: 34.99, date: '2024-01-02', status: 'completed', category: 'Refund' },
  { id: 'txn_015', type: 'groceries', description: 'Aldi Nord', amount: -38.67, date: '2024-01-01', status: 'completed', category: 'Groceries' },
  { id: 'txn_016', type: 'shopping', description: 'H&M Store', amount: -78.50, date: '2023-12-30', status: 'completed', category: 'Shopping' },
  { id: 'txn_017', type: 'atm', description: 'ATM Withdrawal - Munich', amount: -100.00, date: '2023-12-29', status: 'completed', category: 'Cash' },
  { id: 'txn_018', type: 'transfer', description: 'Payment to Michael K.', amount: -75.00, date: '2023-12-28', status: 'failed', category: 'Transfer' },
  { id: 'txn_019', type: 'utilities', description: 'Spotify Premium', amount: -9.99, date: '2023-12-27', status: 'completed', category: 'Entertainment' },
  { id: 'txn_020', type: 'salary', description: 'Bonus Payment - TechCorp GmbH', amount: 1500.00, date: '2023-12-26', status: 'completed', category: 'Income' },
];

export const demoBeneficiaries: Beneficiary[] = [
  { id: 'ben_001', name: 'Sarah Mueller', accountNumber: 'DE89 3704 0044 0532 1234 56', bank: 'Deutsche Bank', avatar: 'SM' },
  { id: 'ben_002', name: 'Michael Klein', accountNumber: 'DE89 3704 0044 0532 7890 12', bank: 'Commerzbank', avatar: 'MK' },
  { id: 'ben_003', name: 'Hans Weber', accountNumber: 'DE89 3704 0044 0532 3456 78', bank: 'Sparkasse', avatar: 'HW' },
  { id: 'ben_004', name: 'Lisa Schmidt', accountNumber: 'DE89 3704 0044 0532 9012 34', bank: 'ING', avatar: 'LS' },
  { id: 'ben_005', name: 'TechCorp GmbH', accountNumber: 'DE89 3704 0044 0532 5678 90', bank: 'UniCredit', avatar: 'TC' },
];

export const demoStatements: Statement[] = [
  { id: 'stmt_001', month: 'January', year: 2024, openingBalance: 11250.00, closingBalance: 12847.52, totalCredits: 5034.99, totalDebits: 3437.47, transactionCount: 15 },
  { id: 'stmt_002', month: 'December', year: 2023, openingBalance: 9800.00, closingBalance: 11250.00, totalCredits: 6000.00, totalDebits: 4550.00, transactionCount: 22 },
  { id: 'stmt_003', month: 'November', year: 2023, openingBalance: 8500.00, closingBalance: 9800.00, totalCredits: 4500.00, totalDebits: 3200.00, transactionCount: 18 },
  { id: 'stmt_004', month: 'October', year: 2023, openingBalance: 7200.00, closingBalance: 8500.00, totalCredits: 4800.00, totalDebits: 3500.00, transactionCount: 20 },
  { id: 'stmt_005', month: 'September', year: 2023, openingBalance: 6100.00, closingBalance: 7200.00, totalCredits: 4500.00, totalDebits: 3400.00, transactionCount: 17 },
  { id: 'stmt_006', month: 'August', year: 2023, openingBalance: 5500.00, closingBalance: 6100.00, totalCredits: 4500.00, totalDebits: 3900.00, transactionCount: 19 },
  { id: 'stmt_007', month: 'July', year: 2023, openingBalance: 4800.00, closingBalance: 5500.00, totalCredits: 4500.00, totalDebits: 3800.00, transactionCount: 16 },
  { id: 'stmt_008', month: 'June', year: 2023, openingBalance: 4200.00, closingBalance: 4800.00, totalCredits: 4500.00, totalDebits: 3900.00, transactionCount: 21 },
  { id: 'stmt_009', month: 'May', year: 2023, openingBalance: 3800.00, closingBalance: 4200.00, totalCredits: 4500.00, totalDebits: 4100.00, transactionCount: 18 },
  { id: 'stmt_010', month: 'April', year: 2023, openingBalance: 3500.00, closingBalance: 3800.00, totalCredits: 4500.00, totalDebits: 4200.00, transactionCount: 15 },
  { id: 'stmt_011', month: 'March', year: 2023, openingBalance: 3000.00, closingBalance: 3500.00, totalCredits: 4500.00, totalDebits: 4000.00, transactionCount: 19 },
  { id: 'stmt_012', month: 'February', year: 2023, openingBalance: 2500.00, closingBalance: 3000.00, totalCredits: 4500.00, totalDebits: 4000.00, transactionCount: 14 },
];

export const spendingCategories = [
  { name: 'Housing', amount: 950, percentage: 35, color: 'hsl(var(--primary))' },
  { name: 'Shopping', amount: 424, percentage: 16, color: 'hsl(var(--accent))' },
  { name: 'Groceries', amount: 151, percentage: 6, color: 'hsl(var(--info))' },
  { name: 'Bills', amount: 150, percentage: 6, color: 'hsl(var(--warning))' },
  { name: 'Entertainment', amount: 23, percentage: 1, color: 'hsl(var(--destructive))' },
  { name: 'Cash', amount: 300, percentage: 11, color: 'hsl(215, 16%, 47%)' },
  { name: 'Other', amount: 675, percentage: 25, color: 'hsl(var(--muted-foreground))' },
];

export const generateReferenceNumber = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SNR';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
