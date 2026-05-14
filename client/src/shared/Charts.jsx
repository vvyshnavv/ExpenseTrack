import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const CATEGORY_COLORS = {
  Food: '#14532d',
  Shopping: '#5b8daf',
  Travel: '#64748b',
  Bills: '#78716c',
  Entertainment: '#a78bfa',
  Other: '#94a3b8'
}

function colorForCategory(name){
  return CATEGORY_COLORS[name] || '#94a3b8'
}

export default function Charts({ expenses }){
  const map = {}
  expenses.forEach(e => {
    map[e.category] = (map[e.category] || 0) + Number(e.amount)
  })
  const data = Object.keys(map).map(k => ({ name: k, value: map[k] }))

  return (
    <div className="flex flex-col">
      {data.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-gray-100 bg-white px-4 py-10 shadow-sm">
          <p className="text-sm text-gray-500">No data</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white px-4 pb-5 pt-6 shadow-sm">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={data}
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={colorForCategory(entry.name)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {data.map(entry => (
              <div key={entry.name} className="flex items-center gap-2 text-[13px] text-gray-700">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: colorForCategory(entry.name) }}
                  aria-hidden
                />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
