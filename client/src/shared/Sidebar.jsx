import React from 'react'
import { Home, PieChart, Calendar, Settings } from 'lucide-react'

export default function Sidebar(){
  return (
    <aside className="w-64 bg-white p-6 hidden md:block">
      <div className="mb-8">
        <h2 className="text-2xl display-heading text-black">Finance</h2>
        <div className="text-sm text-gray-500">Expense Tracker</div>
      </div>
      <nav className="space-y-3">
        <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50" href="#"><Home size={18}/> <span className="font-semibold">Dashboard</span></a>
        <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50" href="#"><PieChart size={18}/> <span className="font-semibold">Analytics</span></a>
        <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50" href="#"><Calendar size={18}/> <span className="font-semibold">Calendar</span></a>
        <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50" href="#"><Settings size={18}/> <span className="font-semibold">Settings</span></a>
      </nav>
    </aside>
  )
}
