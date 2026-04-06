import { api } from "~/lib/api-client";
import type { Question } from "~/types/api";

export const getSessionTestQuestions = async (id:string): Promise<{ data: Question[] }> => {
  const {data} = await api.get<Question[]>(`bootcamp/session_test_question_by_test_id/${id}`);

  for (let idx = 0; idx < data.length; idx++) {
    if (data[idx].options) {
      data[idx].options = data[idx].options.map(opt => ({
        ...opt,
        is_answer: `${opt.is_answer}` === "1"
      }));
    }
  }

  return {data};
};
