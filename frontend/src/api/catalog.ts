import { apiClient, call } from './client';
import type {
  CatalogItem,
  CatalogItemInput,
  Customer,
  CustomerDetail,
  CustomerInput,
  Paged,
} from '@/types/catalog';

interface PageParams {
  page?: number;
  limit?: number;
  search?: string;
}

type CustomerList = { customers: Customer[]; total: number; page: number; totalPages: number };
type ItemList = { items: CatalogItem[]; total: number; page: number; totalPages: number };

function params({ page = 1, limit = 20, search }: PageParams) {
  return { page, limit, search: search?.trim() || undefined };
}

export async function listCustomers(query: PageParams): Promise<Paged<Customer>> {
  const data = await call(() => apiClient.get<CustomerList>('/customers', { params: params(query) }));
  return { rows: data.customers, total: data.total, page: data.page, totalPages: data.totalPages };
}

export function getCustomer(id: string): Promise<CustomerDetail> {
  return call(() => apiClient.get<CustomerDetail>(`/customers/${id}`));
}

export function saveCustomer(input: CustomerInput, id?: string): Promise<Customer> {
  return call(() => (id ? apiClient.put<Customer>(`/customers/${id}`, input) : apiClient.post<Customer>('/customers', input)));
}

export function deleteCustomer(id: string): Promise<unknown> {
  return call(() => apiClient.delete(`/customers/${id}`));
}

export async function listItems(query: PageParams): Promise<Paged<CatalogItem>> {
  const data = await call(() => apiClient.get<ItemList>('/items', { params: params(query) }));
  return { rows: data.items, total: data.total, page: data.page, totalPages: data.totalPages };
}

export function saveItem(input: CatalogItemInput, id?: string): Promise<CatalogItem> {
  return call(() => (id ? apiClient.put<CatalogItem>(`/items/${id}`, input) : apiClient.post<CatalogItem>('/items', input)));
}

export function deleteItem(id: string): Promise<unknown> {
  return call(() => apiClient.delete(`/items/${id}`));
}
