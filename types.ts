
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  BID_ANALYSIS = 'BID_ANALYSIS',
  SIMULATOR = 'SIMULATOR',
  COMPETITOR = 'COMPETITOR',
  FAILURE_ANALYSIS = 'FAILURE_ANALYSIS',
  SETTINGS = 'SETTINGS'
}

export interface KPI {
  label: string;
  value: string;
  trend: number;
  icon: string;
  color?: string;
}

export interface BidEntry {
  id: string;
  title: string;
  agency: string;
  price: number;
  rate: number;
  date: string;
  status: 'WIN' | 'LOSS' | 'PENDING';
  reason?: string;
}
