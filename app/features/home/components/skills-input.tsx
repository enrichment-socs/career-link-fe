"use client";

import { useRef, useState} from "react";
import { Check, Plus, X } from "lucide-react";
import {cn} from "cn";
import {Button} from "~/components/ui/button";
import {Badge} from "~/components/ui/badge";
import {Input} from "~/components/ui/input";

interface SkillsInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    suggestions: string[];
    placeholder?: string;
    disabled?: boolean;
}

export function SkillsInput({
                                value,
                                onChange,
                                suggestions,
                                placeholder = "Type a skill, e.g. React",
                                disabled,
                            }: SkillsInputProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const has = (s: string) =>
        value.some((v) => v.toLowerCase() === s.trim().toLowerCase());

    const add = (raw: string) => {
        const s = raw.trim();
        if (!s || has(s)) return;
        onChange([...value, s]);
        setQuery("");
        inputRef.current?.focus();
    };

    const remove = (s: string) => onChange(value.filter((v) => v !== s));

    const q = query.trim().toLowerCase();
    const filtered = suggestions
        .filter((s) => !has(s) && s.toLowerCase().includes(q))
        .slice(0, 8);
    const canCreate =
        q && !has(query) && !suggestions.some((s) => s.toLowerCase() === q);

    const handleKeyDown = (e: { key: string; preventDefault: () => void; }) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(query);
        } else if (e.key === "Backspace" && !query && value.length) {
            remove(value[value.length - 1]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const handlePaste = (e: { clipboardData: { getData: (arg0: string) => string; }; preventDefault: () => void; }) => {
        const text = e.clipboardData?.getData("text") ?? "";
        if (!text.includes(",")) return;
        e.preventDefault();
        const next = [...value];
        text.split(",").forEach((raw: string) => {
            const s = raw.trim();
            if (s && !next.some((v) => v.toLowerCase() === s.toLowerCase())) next.push(s);
        });
        onChange(next);
        setQuery("");
    };

    return (
        <div
            className="flex flex-col gap-2"
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
            }}
        >
            <div
                onClick={() => inputRef.current?.focus()}
                className={cn(
                    "flex min-h-10 max-h-28 w-full flex-wrap content-start items-center gap-1.5 overflow-y-auto rounded-md border border-input bg-background px-2 py-1.5 text-sm",
                    disabled && "cursor-not-allowed opacity-50"
                )}
            >
                {value.map((skill) => (
                    <Badge
                        key={skill}
                        variant="secondary"
                        className="gap-1 rounded-full py-1 pl-3 pr-1.5 font-normal"
                    >
                        {skill}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                remove(skill);
                            }}
                            className="h-4 w-4 rounded-full p-0 hover:bg-muted-foreground/20"
                            aria-label={`Remove ${skill}`}
                        >
                            <X className="h-3 w-3"/>
                        </Button>
                    </Badge>
                ))}
            </div>

            <div className="relative">
                <Input
                    ref={inputRef}
                    value={query}
                    disabled={disabled}
                    placeholder={value.length ? "Enter your skills" : placeholder}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                />

                {open && (filtered.length > 0 || canCreate) && (
                    <ul className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
                        {filtered.map((s) => (
                            <li key={s}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => add(s)}
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                                >
                                    <Check className="h-4 w-4 opacity-0"/>
                                    {s}
                                </button>
                            </li>
                        ))}
                        {canCreate && (
                            <li>
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => add(query)}
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                                >
                                    <Plus className="h-4 w-4"/>
                                    Add "{query.trim()}"
                                </button>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}