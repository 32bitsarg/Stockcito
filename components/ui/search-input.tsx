"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function SearchInput({
    placeholder,
    className
}: {
    placeholder?: string,
    className?: string
}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    function handleSearch(term: string) {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('query', term)
        } else {
            params.delete('query')
        }
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className={cn("relative flex-1 max-w-sm group", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-50 transition-colors" />
            <Input
                placeholder={placeholder || "Buscar..."}
                className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-950 transition-all rounded-lg font-medium"
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
            />
        </div>
    )
}
