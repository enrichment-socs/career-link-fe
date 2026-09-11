import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import toast from "react-hot-toast";
import { getErrorMessage } from "~/lib/error";
import {
  duplicateBootcamp,
  type DuplicateBootcampInput,
  duplicateBootcampInputSchema
} from "~/features/bootcamp/api/duplicate-bootcamp";
import Field from "~/components/ui/form-field";
import {useEffect, useState} from "react";
import type {Bootcamp} from "~/types/api";
import {getBootcamps} from "~/features/bootcamp/api/get-bootcamps";
import {Check, ChevronsUpDown, GraduationCap, Loader2} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "cmdk";
import {Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import {cn} from "cn";
import {getBootcampBatch} from "~/features/bootcamp/api/get-bootcamp-batch";

interface Props {
  onSuccess: () => Promise<void>;
}

export const DuplicateBootcamp = ({
  onSuccess,
}: Props) => {

  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([])
  const [isLoadingBootcamps, setIsLoadingBootcamps] = useState(true);
    const form = useForm<DuplicateBootcampInput>({
    resolver: zodResolver(duplicateBootcampInputSchema),
    defaultValues: {
      bootcamp_id:"",
      batch: "",
      short_name:""
    },
  });

  useEffect(() => {
    fetchBootcamps();
  }, []);

  const onSubmit = async (data: DuplicateBootcampInput) => {
    const toastId = toast.loading("Duplicating bootcamp...");
    try {
      const res = await duplicateBootcamp({ data });
      toast.success("Successfully duplicate bootcamp", { id: toastId });
      form.reset();
      await onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error), {
        id: toastId,
      });
    }
  };

  const bootcampId = form.watch("bootcamp_id");

  useEffect(() => {
    if (!bootcampId) return;
    fetchBootcampBatch(bootcampId);
  }, [bootcampId]);

  const fetchBootcamps = async () => {
    try {
      const res = await getBootcamps();
      setBootcamps(res.data)
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoadingBootcamps(false);
    }
  }
    const fetchBootcampBatch = async (bootcampId: string) => {
      try {
        const res = await getBootcampBatch(bootcampId);
        form.setValue("batch", String(res+1));
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {

      }
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
            control={form.control}
            name="bootcamp_id"
            render={({ field }) => {
              const [open, setOpen] = useState(false);
              const selected = bootcamps.find((b) => b.id === field.value);

              return (
                  <FormItem className="w-full flex flex-col">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Existing Bootcamp
                    </FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              disabled={isLoadingBootcamps}
                              className={cn(
                                  "w-full h-10 rounded-md justify-between font-normal border-input bg-background hover:border-accent/50 hover:bg-background transition-colors",
                                  !field.value && "text-muted-foreground"
                              )}
                          >
                            <span className="flex items-center gap-2 truncate">
                              {isLoadingBootcamps ? (
                                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                              ) : (
                                  <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                              <span className="truncate">
                                {isLoadingBootcamps
                                    ? "Loading bootcamps..."
                                    : selected?.name ?? "Select a bootcamp"}
                              </span>
                            </span>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 rounded-md " />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                          className="w-full h-full p-2 rounded-md bg-white shadow-xs border-gray-200 border-2"
                          align="start"
                      >
                        <Command className={"w-full flex flex-col gap-2"}>
                          <CommandInput placeholder="Search bootcamps..." className="h-9 px-5 rounded-md" />
                          <CommandList className="w-full max-h-64 overflow-scroll">
                            <CommandEmpty>No bootcamps found</CommandEmpty>
                            <CommandGroup className={"flex flex-col gap-2"}>
                              {bootcamps.map((bootcamp) => (
                                  <CommandItem
                                      key={bootcamp.id}
                                      value={bootcamp.name}
                                      onSelect={() => {
                                        field.onChange(bootcamp.id);
                                        setOpen(false);
                                      }}
                                      className="cursor-pointer flex flex-row gap-1 items-center border-b-1 border-t-1 py-2"
                                  >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            bootcamp.id === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    Batch {bootcamp.batch} - {bootcamp.name}
                                  </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
              );
            }}
        />
        <Field
            control={form.control}
            placeholder="Enter Batch"
            minValue = {1}
            label="Bootcamp Batch"
            type="number"
            name="batch"
        />
        <Field
            control={form.control}
            placeholder="Enter short name"
            label="Short Name"
            type="text"
            name="short_name"
        />

        <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={`bg-accent ${
                form.formState.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {form.formState.isSubmitting ? "Duplicating..." : "Duplicate"}
        </Button>
      </form>
    </Form>
  );
};
