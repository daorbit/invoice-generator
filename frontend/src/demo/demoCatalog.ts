import type { CatalogItem, Customer } from '@/types/catalog';
import { daysAgo } from './demoDates';

const customer = (id: string, name: string, contactName: string, email: string, gstin: string, address: string, stateCode: string): Customer => ({
  id,
  name,
  contactName,
  email,
  phone: '',
  website: '',
  gstin,
  address,
  shippingAddress: '',
  stateCode,
  notes: '',
  outstanding: 0,
  updatedAt: daysAgo(3),
});

export const demoCustomers: Customer[] = [
  customer('c1', 'Northwind Traders', 'Priya Sharma', 'accounts@northwind.example', '27AAACN1234A1Z2', 'Lower Parel, Mumbai, Maharashtra 400013', '27'),
  customer('c2', 'Bluebird Foods', 'Rahul Mehta', 'finance@bluebird.example', '29AABCB5678B1Z9', 'Koramangala, Bengaluru, Karnataka 560034', '29'),
  customer('c3', 'Lumen Health', 'Ananya Iyer', 'ap@lumen.example', '33AACCL9012C1Z4', 'Anna Salai, Chennai, Tamil Nadu 600002', '33'),
  customer('c4', 'Orbit Retail', 'Karan Singh', 'billing@orbitretail.example', '', 'Connaught Place, New Delhi 110001', '07'),
  customer('c5', 'Greenleaf Co.', 'Meera Nair', 'hello@greenleaf.example', '32AADCG3456D1Z7', 'MG Road, Kochi, Kerala 682016', '32'),
];

const item = (id: string, name: string, description: string, unit: string, rate: number, hsn: string): CatalogItem => ({
  id,
  name,
  description,
  kind: 'service',
  unit,
  rate,
  hsn,
  taxRate: 18,
  updatedAt: daysAgo(10),
});

export const demoItems: CatalogItem[] = [
  item('i1', 'Website design', 'Responsive marketing site, up to 8 pages', 'project', 85000, '998314'),
  item('i2', 'SEO retainer', 'Monthly technical and on-page SEO', 'month', 30000, '998365'),
  item('i3', 'Brand identity', 'Logo, colour system and guidelines', 'project', 60000, '998391'),
  item('i4', 'Development hours', 'Front-end and back-end development', 'hour', 2500, '998314'),
  item('i5', 'Hosting and support', 'Managed hosting with priority support', 'month', 6000, '998315'),
];
