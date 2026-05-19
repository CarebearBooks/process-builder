export interface ServiceOption {
  id: string
  name: string
  vertical: string
  icon: string
}

export const DEV_SERVICES: ServiceOption[] = [
  { id: 'svc-payroll',     name: 'Payroll Processing',     vertical: 'Tax & Bookkeeping',  icon: '💼' },
  { id: 'svc-tax-1040',    name: 'Tax Preparation — 1040', vertical: 'Tax & Bookkeeping',  icon: '📊' },
  { id: 'svc-tax-1120s',   name: 'Tax Preparation — 1120S',vertical: 'Tax & Bookkeeping',  icon: '📊' },
  { id: 'svc-tax-1065',    name: 'Tax Preparation — 1065', vertical: 'Tax & Bookkeeping',  icon: '📊' },
  { id: 'svc-bookkeeping', name: 'Monthly Bookkeeping',    vertical: 'Tax & Bookkeeping',  icon: '📒' },
  { id: 'svc-afh-billing', name: 'AFH Resident Billing',   vertical: 'Adult Family Home',  icon: '🏠' },
  { id: 'svc-afh-comp',    name: 'AFH Compliance',         vertical: 'Adult Family Home',  icon: '📋' },
  { id: 'svc-nonprofit',   name: '990 Filing',             vertical: 'Nonprofit',          icon: '📑' },
]