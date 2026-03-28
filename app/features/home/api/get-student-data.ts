import { api } from "~/lib/api-client";
import type { User } from "~/types/api";

export const getUsers = (
    page: number,
    size?: number,
    search?: string,
    major?: string,
    minGpa?: string,
    maxGpa?: string,
    gpaSort?: string,
    status?: string
): Promise<{ data: User[]; meta: { last_page: number } }> => {

  const params = new URLSearchParams({ page: String(page) });

  if (size) params.set('per_page', String(size));
  if (search) params.set('search', search);
  if (major) params.set('major', major);

  if (minGpa) params.set('min_gpa', minGpa);
  if (maxGpa) params.set('max_gpa', maxGpa);
  if (gpaSort) params.set('gpa_sort', gpaSort);
  if (status) params.set('status', status);

  return api.get(`/user/paginate?${params.toString()}`);
};