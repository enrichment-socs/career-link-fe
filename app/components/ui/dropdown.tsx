import { type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import {useEffect} from "react";

export interface SelectValue<TId> {
    value: TId;
    text: string;
}

interface DropdownProps<T extends FieldValues, TId> {
    control?: Control<T>;
    name: FieldPath<T>;
    label: string;
    values: SelectValue<TId>[];
    defaultValue?: TId;
}

export default function Dropdown<T extends FieldValues>({
     control,
     name,
     label,
     values,
    defaultValue,
}: DropdownProps<T, string>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => {
                useEffect(() => {
                    if (!field.value && defaultValue) {
                        field.onChange(defaultValue);
                    }
                }, [field.value, defaultValue]);

                return (
                    <FormItem className="w-full">
                        {label && <FormLabel>{label}</FormLabel>}

                        <FormControl>
                            <select
                                {...field}
                                value={field.value ?? ""}
                                className="w-full bg-white text-black border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                            >
                                <option value="">Select an option</option>
                                {values.map((e, idx) => (
                                    <option key={idx} value={e.value}>
                                        {e.text}
                                    </option>
                                ))}
                            </select>
                        </FormControl>

                        <FormMessage/>
                    </FormItem>
                );
            }}
        />
    );
}