import { Music, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const initial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-zinc-900 dark:text-zinc-100" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">YT2MP3</span>
        </div>

        <div className="flex items-center gap-3">
          {user?.name && (
            <span className="hidden text-sm text-zinc-500 sm:inline">{user.name}</span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-normal text-zinc-400">
                Signed in as {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.5} />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
