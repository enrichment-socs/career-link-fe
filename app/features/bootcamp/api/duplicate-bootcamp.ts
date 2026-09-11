import { z } from "zod";
import { api } from "~/lib/api-client";
import type {Bootcamp} from "~/types/api";

export const duplicateBootcampInputSchema = z.object({
  bootcamp_id: z.string().min(1, "Name is required"),
  batch: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
    message: "Expected number, received a string"
  }),
    short_name: z.string().min(1, "Short name is required"),
});

export type DuplicateBootcampInput = z.infer<typeof duplicateBootcampInputSchema>;

export const duplicateBootcamp = ({
  data,
}: {
  data: DuplicateBootcampInput;
}): Promise<{ data: Bootcamp }> => {
    return api.post("/bootcamp/duplicate", data);
};
