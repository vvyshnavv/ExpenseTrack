import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, LogOut } from 'lucide-react'

export default function Header(){
  const navigate = useNavigate()

  function handleLogout(){
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-200">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <LayoutGrid className="h-5 w-5 text-gray-700" strokeWidth={1.75} />
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">Expense Tracker</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[13px] font-normal text-gray-700 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  )
}
