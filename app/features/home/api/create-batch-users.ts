import { api } from "~/lib/api-client";

export interface BatchUserInput {
  email: string;
  name: string;
  major: string;
  gpa:number;
  status:string;
  cv:string;
  phone: string;
  nim: string;
  cv_file_path?: string;
  company_name?: string;
  business_type?: string;
  university_name?: string;
}

export interface BatchUsersRequest {
  users: BatchUserInput[];
}

export const createBatchUsers = async (users: BatchUserInput[]) => {
  const response = await api.post("/user/batch", {
    users
  });
  return response.data;
};