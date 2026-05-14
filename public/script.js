// script.js - handles auth pages and dashboard interactions

const api = {
  signup: '/api/auth/signup',
  login: '/api/auth/login',
  budget: '/api/budget',
  expenses: '/api/expenses',
};

// Utility alerts
function showMessage(msg, type = 'info') {
  alert(msg);
}

// ---------- Index (Login/Signup) ----------
if (document.getElementById('auth-form')) {
  const form = document.getElementById('auth-form');
  const toggle = document.getElementById('toggle-link') || document.querySelector('.signup-link');
  const title = document.getElementById('form-title') || document.querySelector('.display-heading') || document.querySelector('h1');
  let isLogin = true;

  // Redirect if already logged in
  if (localStorage.getItem('token')) {
    window.location.href = '/dashboard.html';
  }

  // Safe toggle handler (some layouts use different markup)
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      if (title) title.textContent = isLogin ? 'Login' : 'Sign up';
      // update toggle text if it's a link/button
      if (toggle.tagName && (toggle.tagName.toLowerCase() === 'a' || toggle.tagName.toLowerCase() === 'button')) {
        toggle.textContent = isLogin ? 'Sign up' : 'Login';
      }
      const submitBtn = document.getElementById('submit-btn');
      if (submitBtn) submitBtn.textContent = isLogin ? 'Log in' : 'Sign up';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const url = isLogin ? api.login : api.signup;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth error');
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard.html';
    } catch (err) {
      showMessage(err.message || 'Error');
    }
  });
}

// ---------- Dashboard ----------
if (document.getElementById('budget-amount')) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
  }

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const budgetAmountEl = document.getElementById('budget-amount');
  const totalExpensesEl = document.getElementById('total-expenses');
  const remainingEl = document.getElementById('remaining');
  const expensesListEl = document.getElementById('expenses-list');
  const budgetForm = document.getElementById('budget-form');
  const budgetInput = document.getElementById('budget-input');
  const expenseForm = document.getElementById('expense-form');
  const logoutBtn = document.getElementById('logout-btn');

  let expenses = [];

  async function fetchBudget() {
    const res = await fetch(api.budget, { headers });
    if (!res.ok) return; // ignore
    const data = await res.json();
    budgetAmountEl.textContent = `$${data.budget.toFixed(2)}`;
    budgetInput.value = data.budget;
    updateTotals();
  }

  async function saveBudget(e) {
    e.preventDefault();
    const val = parseFloat(budgetInput.value) || 0;
    try {
      const res = await fetch(api.budget, { method: 'POST', headers, body: JSON.stringify({ budget: val }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      budgetAmountEl.textContent = `$${data.budget.toFixed(2)}`;
      showMessage('Budget saved', 'success');
      updateTotals();
    } catch (err) {
      showMessage(err.message || 'Error');
    }
  }

  async function fetchExpenses() {
    try {
      const res = await fetch(api.expenses, { headers });
      const data = await res.json();
      expenses = data.expenses || [];
      renderExpenses();
      updateTotals();
    } catch (err) {
      console.error(err);
    }
  }

  async function addExpense(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value || null;
    try {
      const res = await fetch(api.expenses, { method: 'POST', headers, body: JSON.stringify({ title, amount, category, date }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      document.getElementById('expense-form').reset();
      expenses.unshift(data.expense);
      renderExpenses();
      updateTotals();
    } catch (err) {
      showMessage(err.message || 'Error');
    }
  }

  async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`${api.expenses}/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Delete failed');
      expenses = expenses.filter((e) => e._id !== id);
      renderExpenses();
      updateTotals();
    } catch (err) {
      showMessage(err.message || 'Error');
    }
  }

  function renderExpenses() {
    expensesListEl.innerHTML = '';
    if (!expenses.length) {
      expensesListEl.innerHTML = '<p class="small">No expenses yet</p>';
      return;
    }

    expenses.forEach((exp) => {
      const div = document.createElement('div');
      div.className = 'expense-row';
      div.innerHTML = `
        <div class="expense-info">
          <div class="expense-title">${exp.title}</div>
          <div class="small">${new Date(exp.date).toLocaleDateString()} • ${exp.category}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <div class="expense-amount">$${exp.amount.toFixed(2)}</div>
          <button class="btn btn-ghost" onclick="deleteExpense('${exp._id}')">Delete</button>
        </div>
      `;
      expensesListEl.appendChild(div);
    });
  }

  function updateTotals() {
    const budget = parseFloat(budgetInput.value) || 0;
    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
    totalExpensesEl.textContent = `$${total.toFixed(2)}`;
    const remain = budget - total;
    remainingEl.textContent = `$${remain.toFixed(2)}`;
    remainingEl.className = remain >= 0 ? 'green' : 'danger';
    budgetAmountEl.textContent = `$${budget.toFixed(2)}`;
    renderChart();
  }

  // Chart
  let chart = null;
  function renderChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    const categories = {};
    expenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    if (chart) chart.destroy();
    chart = new Chart(ctx.getContext('2d'), {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data, backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#607d8b'] }],
      },
    });
  }

  // Expose delete for inline onclick
  window.deleteExpense = deleteExpense;

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  });

  // Bind forms
  budgetForm.addEventListener('submit', saveBudget);
  expenseForm.addEventListener('submit', addExpense);

  // Initial fetch
  (async function init() {
    await fetchBudget();
    await fetchExpenses();
  })();
}
