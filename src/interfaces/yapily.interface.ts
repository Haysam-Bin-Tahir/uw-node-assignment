export interface Institution {
  id: string;
  name: string;
  fullName: string;
}

export interface Account {
  id: string;
  accountType: string;
  accountNumber: string;
  balance: number;
  currency: string;
  institutionId: string;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
  accountId: string;
  status: string;
  reference?: string;
}

export interface ConsentResponse {
  consentToken: string;
  institutionId: string;
  status: string;
} 