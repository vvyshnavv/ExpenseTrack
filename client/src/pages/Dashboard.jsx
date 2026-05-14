import React, { useEffect, useMemo, useState } from 'react'
import Header from '../shared/Header'
import Expenses from '../shared/Expenses'
import Charts from '../shared/Charts'
import api from '../api'
import { toast, ToastContainer } from 'react-toastify'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingDown,
  Wallet
} from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function daysInMonth(year, month){
  return new Date(year, month + 1, 0).getDate()
}

function buildCalendarCells(year, month){
  const first = new Date(year, month, 1)
  const padStart = first.getDay()
  const totalDays = daysInMonth(year, month)
  const cells = []
  for(let i = 0; i < padStart; i++) cells.push(null)
  for(let d = 1; d <= totalDays; d++) cells.push(d)
  while(cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function Dashboard(){
  const [budget, setBudget] = useState(0)
  const [expenses, setExpenses] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [budgetInput, setBudgetInput] = useState(0)
  const [editingBudget, setEditingBudget] = useState(false)

  const now = new Date()
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(() => now.getDate())

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const viewYear = viewDate.getFullYear()
  const viewMonth = viewDate.getMonth()
  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const calendarCells = useMemo(() => buildCalendarCells(viewYear, viewMonth), [viewYear, viewMonth])

  const monthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth
    })
  }, [expenses, viewYear, viewMonth])

  const monthTotal = monthExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const monthCount = monthExpenses.length
  const remaining = budget - expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalSpentAll = expenses.reduce((s, e) => s + Number(e.amount), 0)

  useEffect(() => {
    (async () => {
      try{
        const b = await api.get('/api/budget', { headers })
        setBudget(b.data.budget || 0)
        setBudgetInput(b.data.budget || 0)
        const e = await api.get('/api/expenses', { headers })
        setExpenses(e.data.expenses || [])
      }catch(err){
        console.error(err)
        const offline = !err.response
        toast.error(
          offline
            ? 'Cannot reach the API. In a second terminal, from the project root run: npm start (MongoDB must be running and MONGO_URI set in .env).'
            : 'Could not load budget or expenses.'
        )
      }
    })()
  }, [])

  function goPrevMonth(){
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    setSelectedDay(1)
  }

  function goNextMonth(){
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    setSelectedDay(1)
  }

  function goToday(){
    const t = new Date()
    setViewDate(new Date(t.getFullYear(), t.getMonth(), 1))
    setSelectedDay(t.getDate())
  }

  useEffect(() => {
    const dim = daysInMonth(viewYear, viewMonth)
    if(selectedDay > dim) setSelectedDay(dim)
  }, [viewYear, viewMonth, selectedDay])

  async function handleSetBudget(e){
    e.preventDefault()
    try{
      const res = await api.post('/api/budget', { budget: Number(budgetInput) }, { headers })
      setBudget(res.data.budget)
      setEditingBudget(false)
      toast.success('Budget updated')
    }catch(err){ toast.error('Failed to set budget') }
  }

  async function handleAddExpense(payload){
    try{
      const res = await api.post('/api/expenses', payload, { headers })
      setExpenses(prev => [res.data.expense, ...prev])
      setShowAdd(false)
      toast.success('Expense added')
    }catch(err){ toast.error('Failed to add expense') }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-gray-900 antialiased">
      <ToastContainer />
      <Header />

      <main className="mx-auto max-w-6xl px-6 pb-10 pt-6 lg:px-8 lg:pt-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="flex min-h-[132px] flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Target className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.75} />
                <span className="text-[13px] font-medium text-gray-500">Monthly Budget</span>
              </div>
              {!editingBudget ? (
                <button
                  type="button"
                  onClick={() => { setEditingBudget(true); setBudgetInput(budget) }}
                  className="shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[12px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
              ) : (
                <form onSubmit={handleSetBudget} className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                  <input
                    type="number"
                    className="w-20 rounded-md border border-gray-200 px-2 py-1 text-xs"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                  />
                  <button type="submit" className="rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white">Save</button>
                  <button type="button" className="text-[11px] text-gray-500" onClick={() => setEditingBudget(false)}>Cancel</button>
                </form>
              )}
            </div>
            <div className="mt-4 text-[28px] font-bold leading-none tracking-tight text-gray-900">
              ${budget.toFixed(2)}
            </div>
          </div>

          <div className="flex min-h-[132px] flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.75} />
              <span className="text-[13px] font-medium text-gray-500">Total Spent</span>
            </div>
            <div className="mt-4 text-[28px] font-bold leading-none tracking-tight text-[#b91c1c]">
              ${totalSpentAll.toFixed(2)}
            </div>
          </div>

          <div className="flex min-h-[132px] flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.75} />
              <span className="text-[13px] font-medium text-gray-500">Remaining</span>
            </div>
            <div className={`mt-4 text-[28px] font-bold leading-none tracking-tight ${remaining >= 0 ? 'text-[#14532d]' : 'text-[#b91c1c]'}`}>
              ${remaining.toFixed(2)}
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="h-5 w-5 text-gray-700" strokeWidth={1.75} />
              <span className="text-lg font-bold tracking-tight text-gray-900">{monthLabel}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-gray-600">
              <button type="button" onClick={goPrevMonth} className="p-1 hover:text-gray-900" aria-label="Previous month">
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button type="button" onClick={goToday} className="px-1 font-medium hover:text-gray-900">Today</button>
              <button type="button" onClick={goNextMonth} className="p-1 hover:text-gray-900" aria-label="Next month">
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <p className="mt-3 text-[13px] text-gray-500">
            {monthCount} expense{monthCount === 1 ? '' : 's'} this month{' '}
            <span className="text-[#b91c1c]">-${monthTotal.toFixed(2)}</span>
          </p>

          <div className="mt-6 grid grid-cols-7 gap-y-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="pb-2 text-center text-[12px] font-medium text-gray-400">{d}</div>
            ))}
            {calendarCells.map((cell, idx) => (
              <div key={idx} className="flex aspect-square max-h-[52px] items-center justify-center sm:max-h-[56px]">
                {cell === null ? (
                  <span />
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(cell)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-[15px] font-medium sm:h-11 sm:w-11 ${
                      selectedDay === cell
                        ? 'border border-gray-200 bg-gray-100 text-gray-900'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {cell}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <Expenses
              expenses={expenses}
              setExpenses={setExpenses}
              headers={headers}
              monthLabel={monthLabel}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onAddExpense={() => setShowAdd(true)}
            />
          </div>
          <div>
            <h3 className="mb-4 flex min-h-[38px] items-center text-base font-bold tracking-tight text-gray-900">By Category</h3>
            <Charts expenses={expenses} />
          </div>
        </div>
      </main>

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onSave={handleAddExpense} />}
    </div>
  )
}

function AddExpenseModal({ onClose, onSave }){
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  function submit(e){
    e.preventDefault()
    onSave({ title, amount: Number(amount), category, date })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Add Expense</h3>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
          <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Entertainment</option>
            <option>Other</option>
          </select>
          <input type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={date} onChange={e => setDate(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50" onClick={onClose}>Cancel</button>
            <button type="submit" className="rounded-lg bg-[#14532d] px-4 py-2 text-sm font-medium text-white hover:bg-[#134028]">Add Expense</button>
          </div>
        </form>
      </div>
    </div>
  )
}
