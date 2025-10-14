import { ThemeToggle } from './ThemeToggle'
export function AppHeader() {
  return (
    <header className=''>
      <div className='mx-auto flex max-w-6xl flex-col gap-4 px-6 py-2 text-slate-900 sm:flex-row sm:items-center sm:justify-between dark:text-slate-100'>
        <div className='space-y-2'></div>
        <div className='flex items-center gap-3'>
          <ThemeToggle />
          <div className='hidden h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-semibold text-white shadow-md sm:flex'>
            NT
          </div>
        </div>
      </div>
    </header>
  )
}
