import {useCallback, useEffect, useMemo, useState} from "react";
import { Loader2, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { getErrorMessage } from "~/lib/error";
import type { Skill } from "~/types/api";
import {createSkill} from "~/features/skills/api/create-skill";
import {deleteSkill} from "~/features/skills/api/delete-skill";
import {getAllSkills} from "~/features/skills/api/get-all-skills";

const parseNames = (raw: string): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];

    raw.split(",").forEach((part) => {
        const name = part.trim().replace(/\s+/g, " ");
        const key = name.toLowerCase();
        if (name && !seen.has(key)) {
            seen.add(key);
            result.push(name);
        }
    });

    return result;
};

const SkillsManagement = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);

    const [raw, setRaw] = useState("");
    const [search, setSearch] = useState("");
    const [adding, setAdding] = useState(false);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchSkills = useCallback(async () => {
        try {
            const res = await getAllSkills();
            setSkills(res.data);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    const existingKeys = useMemo(
        () => new Set(skills.map((s) => s.name.toLowerCase())),
        [skills]
    );

    const pending = useMemo(() => parseNames(raw), [raw]);
    const newNames = pending.filter((n) => !existingKeys.has(n.toLowerCase()));
    const duplicateNames = pending.filter((n) => existingKeys.has(n.toLowerCase()));

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return [...skills]
            .filter((s) => s.name.toLowerCase().includes(q))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [skills, search]);

    const handleAdd = async () => {
        if (!newNames.length || adding) return;

        setAdding(true);
        const count = newNames.length;
        const toastId = toast.loading(`Adding ${count} skill${count > 1 ? "s" : ""}...`);

        try {
            let res = await createSkill(newNames);
            toast.success(res.message, {id: toastId})
            setRaw("");
            await fetchSkills();
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId });
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (skill: Skill) => {
        setDeletingId(skill.id);
        const toastId = toast.loading(`Deleting ${skill.name}...`);

        try {
            let res = await deleteSkill(skill.id);
            toast.success(res.message, {id: toastId})
            setSkills((prev) => prev.filter((s) => s.id !== skill.id));
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId });
        } finally {
            setDeletingId(null);
            setConfirmId(null);
        }
    };

    return (
        <div className="w-3/4 flex flex-col gap-5">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Add Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            value={raw}
                            disabled={adding}
                            placeholder="Type skills separated by comma, e.g. React, Laravel, Docker"
                            onChange={(e) => setRaw(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAdd();
                                }
                            }}
                        />
                        <Button
                            type="button"
                            onClick={handleAdd}
                            disabled={adding || newNames.length === 0}
                            className="shrink-0"
                        >
                            {adding ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="mr-2 h-4 w-4" />
                            )}
                            Add{newNames.length > 1 ? ` ${newNames.length} skills` : ""}
                        </Button>
                    </div>

                    {newNames.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-xs text-muted-foreground">
                                Will be added ({newNames.length}):
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {newNames.map((name) => (
                                    <Badge
                                        key={name}
                                        variant="secondary"
                                        className="gap-1 rounded-full py-1 pl-3 pr-1.5 font-normal"
                                    >
                                        {name}
                                        <Button
                                            type="button"
                                            disabled={adding}
                                            aria-label={`Remove ${name} from the list`}
                                            onClick={() =>
                                                setRaw(pending.filter((n) => n !== name).join(", "))
                                            }
                                            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {duplicateNames.length > 0 && (
                        <p className="text-xs text-amber-600">
                            Already exists and will be skipped: {duplicateNames.join(", ")}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                    <CardTitle className="text-xl text-primary">
                        All Skills <span className="text-sm font-normal text-muted-foreground">({skills.length})</span>
                    </CardTitle>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            placeholder="Search skills..."
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    {filtered.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            {skills.length === 0 ? "No skills yet. Add some above." : "No skills match your search."}
                        </p>
                    ) : (
                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            {filtered.map((skill) => {
                                const isConfirming = confirmId === skill.id;
                                const isDeleting = deletingId === skill.id;

                                return (
                                    <li
                                        key={skill.id}
                                        className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                                    >
                    <span className="truncate" title={skill.name}>
                      {skill.name}
                    </span>

                    {isConfirming ? (
                        <div className="flex shrink-0 items-center gap-1">
                            <span className="text-xs text-red-600">Delete?</span>
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="h-7 px-2 text-xs"
                                disabled={isDeleting}
                                onClick={() => handleDelete(skill)}
                            >
                                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                disabled={isDeleting}
                                onClick={() => setConfirmId(null)}
                            >
                                No
                            </Button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-red-500 hover:text-red-700"
                            aria-label={`Delete ${skill.name}`}
                            onClick={() => setConfirmId(skill.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </li>
                        );
                    })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SkillsManagement;