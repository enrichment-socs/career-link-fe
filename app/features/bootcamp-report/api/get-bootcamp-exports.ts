import { api } from "~/lib/api-client";

export const getBootcampPretestAnswers = (bootcampId: string): Promise<{ data: any[] }> => {
  return api.get(`bootcamp/${bootcampId}/export/pretest`);
};

export const getBootcampPosttestAnswers = (bootcampId: string): Promise<{ data: any[] }> => {
  return api.get(`bootcamp/${bootcampId}/export/posttest`);
};

export const getBootcampAssignmentAnswers = (bootcampId: string): Promise<{ data: any[] }> => {
  return api.get(`bootcamp/${bootcampId}/export/assignment`);
};

export const getBootcampEvaluationAnswers = (bootcampId: string): Promise<{ data: any[] }> => {
  return api.get(`bootcamp/${bootcampId}/export/evaluation`);
};
