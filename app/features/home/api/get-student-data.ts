import { api } from "~/lib/api-client";
import type { User } from "~/types/api";

export const getUsers = (page: number, size?: number, search?: string, major?: string): Promise<{ data: User[], meta: {last_page: number} }> => {
  const params = new URLSearchParams({ page: String(page) });
  if (size) params.set('per_page', String(size));
  if (search) params.set('search', search);
  if (major) params.set('major', major);
  return api.get(`/user/paginate?${params}`);
};
