import { LockIcon } from "lucide-react";
import type {HTMLProps, ReactNode} from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";

interface Props extends HTMLProps<HTMLDivElement> {
    text: string;
    isLocked?: boolean | undefined;
    lockedMessage?: string;
    defaultValue?: string | undefined;
    children: ReactNode;
}

export default function AccordionLayout({text, isLocked, lockedMessage, defaultValue, children}:Props) {

    return (
        <Accordion type={'single'} defaultValue={defaultValue} className={`${isLocked?'bg-gray-300/80':'bg-white'} w-full shadow-md rounded-md`} collapsible>
            <AccordionItem value={text}>
                <AccordionTrigger className={'flex items-center py-6 px-6 justify-between w-full no-underline hover:no-underline focus:no-underline hover:bg-gray-300/50'}>
                    <h2 className={`font-medium text-xl ${isLocked?'text-black/60':'text-slate-500'}`}>{text}</h2>
                </AccordionTrigger>
                <AccordionContent className={'border-t border-gray-300/80 px-6 py-6 flex flex-col gap-y-4'}>
                    {isLocked ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-6 text-gray-400">
                            <LockIcon className="size-8" />
                            <p className="text-sm font-medium">{lockedMessage || "Complete the previous section to unlock this content."}</p>
                        </div>
                    ) : children}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}