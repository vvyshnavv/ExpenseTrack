import React, { useState } from 'react'
import api from '../api'
import { toast } from 'react-toastify'
import { Edit2, Plus, Trash2, Wallet } from 'lucide-react'

function formatDate(d){ return new Date(d).toLocaleDateString() }

export default function Expenses({
  expenses,
  setExpenses,
  headers,
  monthLabel,
  viewYear,
  viewMonth,
  onAddExpense
}){
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [editing, setEditing] = useState(null)

  function inViewMonth(exp){
    const d = new Date(exp.date)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  }

  function filtered(){
    let list = expenses.filter(inViewMonth)
    if(query) list = list.filter(e => e.title.toLowerCase().includes(query.toLowerCase()))
    if(sort === 'newest') list.sort((a, b) => new Date(b.date) - new Date(a.date))
    if(sort === 'oldest') list.sort((a, b) => new Date(a.date) - new Date(b.date))
    if(sort === 'highest') list.sort((a, b) => b.amount - a.amount)
    if(sort === 'lowest') list.sort((a, b) => a.amount - b.amount)
    if(sort === 'category') list.sort((a, b) => a.category.localeCompare(b.category))
    return list
  }

  async function remove(id){
    if(!confirm('Delete this expense?')) return
    try{
      await api.delete(`/api/expenses/${id}`, { headers })
      setExpenses(expenses.filter(e => e._id !== id))
      toast.success('Deleted')
    }catch(err){ toast.error('Delete failed') }
  }

  async function saveEdit(updated){
    try{
      await api.delete(`/api/expenses/${updated._id}`, { headers })
      const res = await api.post('/api/expenses', {
        title: updated.title,
        amount: updated.amount,
        category: updated.category,
        date: updated.date
      }, { headers })
      const newList = expenses.filter(e => e._id !== updated._id)
      newList.unshift(res.data.expense)
      setExpenses(newList)
      setEditing(null)
      toast.success('Updated')
    }catch(err){ toast.error('Update failed') }
  }

  const list = filtered()
  const hasMonthExpenses = expenses.some(inViewMonth)

  return (
    <div>
      <div className="mb-4 flex min-h-[38px] items-center justify-between gap-4">
        <h2 className="text-base font-bold tracking-tight text-gray-900">{monthLabel}</h2>
        <button
          type="button"
          onClick={onAddExpense}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#14532d] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#134028]"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden />
          Add Expense
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm min-h-[280px]">
        {list.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Wallet className="h-6 w-6 text-gray-500" strokeWidth={1.5} />
            </div>
            <p className="text-base font-bold text-gray-900">No expenses</p>
            <p className="mt-1.5 max-w-xs text-sm text-gray-500">Nothing logged this month yet.</p>
            <button
              type="button"
              onClick={onAddExpense}
              className="mt-6 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Add expense
            </button>
          </div>
        ) : (
          <div>
            {hasMonthExpenses && (
              <div className="mb-4 flex gap-2">
                <input
                  placeholder="Search"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest amount</option>
                  <option value="lowest">Lowest amount</option>
                  <option value="category">Category</option>
                </select>
              </div>
            )}
            <div className="space-y-2">
              {list.map(exp => (
                <div
                  key={exp._id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5"
                >
                  <div>
                    <div className="text-[15px] font-semibold text-gray-900">{exp.title}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{formatDate(exp.date)} • {exp.category}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-[#b91c1c]">${Number(exp.amount).toFixed(2)}</div>
                    <button type="button" className="text-gray-600 hover:text-gray-900" onClick={() => setEditing(exp)} aria-label="Edit">
                      <Edit2 size={17} strokeWidth={1.75} />
                    </button>
                    <button type="button" className="text-gray-400 hover:text-red-600" onClick={() => remove(exp._id)} aria-label="Delete">
                      <Trash2 size={17} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editing && <EditModal exp={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
    </div>
  )
}

function EditModal({ exp, onClose, onSave }){
  const [form, setForm] = useState({ ...exp })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-3 font-semibold text-gray-900">Edit Expense</h3>
        <input className="mb-2 w-full rounded border p-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input className="mb-2 w-full rounded border p-2" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
        <input
          className="mb-2 w-full rounded border p-2"
          value={new Date(form.date).toISOString().slice(0, 10)}
          onChange={e => setForm({ ...form, date: e.target.value })}
          type="date"
        />
        <select className="mb-2 w-full rounded border p-2" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Entertainment</option>
          <option>Other</option>
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" className="px-3 py-1.5 text-sm" onClick={onClose}>Cancel</button>
          <button type="button" className="rounded-lg bg-[#14532d] px-4 py-2 text-sm font-medium text-white" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  )
}
