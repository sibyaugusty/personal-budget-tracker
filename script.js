// Global variables for application state
let transactions = [];
let budgets = [];
let activeSectionId = "dashboard";
const incomeCategories = ["Salary", "Freelance", "Investments", "Gift", "Other Income"];
const expenseCategories = ["Food", "Housing", "Transportation", "Entertainment", "Healthcare", "Utilities", "Shopping", "Education", "Personal Care", "Other"];

// DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Initialize application
    initApp();
});

// Initialize the application
function initApp() {
    loadDataFromLocalStorage();
    setupEventListeners();
    updateCurrentDate();
    setupDefaultData();
    updateUI();
    renderDashboard();
    populateYearSelect();
    setupMobileMenu();


    // Set the current month and year in reports section
    const now = new Date();
    document.getElementById('report-month').value = now.getMonth();

    // Show default section (dashboard)
    showSection('dashboard');
}

// Load data from localStorage
function loadDataFromLocalStorage() {
    const storedTransactions = localStorage.getItem('budgetTrackerTransactions');
    const storedBudgets = localStorage.getItem('budgetTrackerBudgets');

    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
        // Convert date strings back to Date objects
        transactions.forEach(transaction => {
            transaction.date = new Date(transaction.date);
        });
    }

    if (storedBudgets) {
        budgets = JSON.parse(storedBudgets);
    }
}

// Set up default data if none exists
function setupDefaultData() {
    // Only add sample data if no transactions exist
    if (transactions.length === 0) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);

        // Add some sample transactions
        transactions = [
            {
                id: generateId(),
                type: "income",
                amount: 2500,
                category: "Salary",
                date: today,
                description: "Monthly Salary"
            },
            {
                id: generateId(),
                type: "expense",
                amount: 45.99,
                category: "Food",
                date: yesterday,
                description: "Grocery Shopping"
            },
            {
                id: generateId(),
                type: "expense",
                amount: 199.99,
                category: "Entertainment",
                date: lastWeek,
                description: "Concert Tickets"
            }
        ];

        // Add some sample budgets
        budgets = [
            {
                id: generateId(),
                category: "Food",
                amount: 500
            },
            {
                id: generateId(),
                category: "Entertainment",
                amount: 200
            }
        ];

        // Save to localStorage
        saveToLocalStorage();
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);

            // Update active state in navigation
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
    

    // Transaction related events
    document.getElementById('add-transaction-btn').addEventListener('click', showAddTransactionForm);
    document.getElementById('close-transaction-form').addEventListener('click', hideTransactionForm);
    document.getElementById('cancel-transaction').addEventListener('click', hideTransactionForm);
    document.getElementById('transaction-form').addEventListener('submit', handleTransactionFormSubmit);
    document.getElementById('transaction-type').addEventListener('change', updateCategoryOptions);
    document.getElementById('add-first-transaction').addEventListener('click', showAddTransactionForm);
    document.getElementById('view-all-transactions').addEventListener('click', function () {
        document.querySelector('[data-section="transactions"]').click();
    });

    // Budget related events
    document.getElementById('add-budget-btn').addEventListener('click', showAddBudgetForm);
    document.getElementById('close-budget-form').addEventListener('click', hideBudgetForm);
    document.getElementById('cancel-budget').addEventListener('click', hideBudgetForm);
    document.getElementById('budget-form').addEventListener('submit', handleBudgetFormSubmit);
    document.getElementById('add-first-budget').addEventListener('click', showAddBudgetForm);

    // Filters
    document.getElementById('filter-type').addEventListener('change', applyTransactionFilters);
    document.getElementById('filter-category').addEventListener('change', applyTransactionFilters);
    document.getElementById('filter-date').addEventListener('change', handleDateFilterChange);
    document.getElementById('date-from').addEventListener('change', applyTransactionFilters);
    document.getElementById('date-to').addEventListener('change', applyTransactionFilters);

    // Reports filters
    document.getElementById('report-timeframe').addEventListener('change', handleReportTimeframeChange);
    document.getElementById('report-month').addEventListener('change', updateReports);
    document.getElementById('report-year').addEventListener('change', updateReports);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date to display
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

// Update current date on dashboard
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const today = new Date();
    dateElement.textContent = formatDate(today);
}

// Show a specific section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
    activeSectionId = sectionId;

    // Update specific section content if needed
    if (sectionId === 'dashboard') {
        renderDashboard();
    } else if (sectionId === 'transactions') {
        renderTransactionsTable();
        populateFilterCategories();
    } else if (sectionId === 'budgets') {
        renderBudgets();
    } else if (sectionId === 'reports') {
        updateReports();
    }
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('budgetTrackerTransactions', JSON.stringify(transactions));
    localStorage.setItem('budgetTrackerBudgets', JSON.stringify(budgets));
}

// Update UI based on current data
function updateUI() {
    populateCategorySelects();
    renderTransactionsTable();
    renderBudgets();
    updateSummaryCards();
    renderRecentTransactions();
    renderBudgetStatus();
}

// Populate category dropdowns
function populateCategorySelects() {
    // Get the selects
    const transactionCategorySelect = document.getElementById('transaction-category');
    const budgetCategorySelect = document.getElementById('budget-category');
    const filterCategorySelect = document.getElementById('filter-category');

    // Clear existing options
    transactionCategorySelect.innerHTML = '';
    budgetCategorySelect.innerHTML = '';

    // Determine which categories to show based on transaction type
    const transactionType = document.getElementById('transaction-type').value;
    const categories = transactionType === 'income' ? incomeCategories : expenseCategories;

    // Add categories to transaction select
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        transactionCategorySelect.appendChild(option);
    });

    // Add expense categories to budget select
    expenseCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        budgetCategorySelect.appendChild(option);
    });

    // Populate filter categories
    populateFilterCategories();
}

// Update category options based on transaction type
function updateCategoryOptions() {
    populateCategorySelects();
}

// Populate filter categories
function populateFilterCategories() {
    const filterCategorySelect = document.getElementById('filter-category');

    // Save current value
    const currentValue = filterCategorySelect.value;

    // Clear existing options
    filterCategorySelect.innerHTML = '';

    // Add "All Categories" option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    filterCategorySelect.appendChild(allOption);

    // Get unique categories from transactions
    const uniqueCategories = [...new Set(transactions.map(t => t.category))].sort();

    // Add categories to select
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategorySelect.appendChild(option);
    });

    // Restore selected value if it still exists
    if ([...filterCategorySelect.options].some(option => option.value === currentValue)) {
        filterCategorySelect.value = currentValue;
    }
}

// Calculate totals
function calculateTotals() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    return { income, expenses, balance };
}

// Update summary cards on dashboard
function updateSummaryCards() {
    const { income, expenses, balance } = calculateTotals();

    document.getElementById('total-balance').textContent = formatCurrency(balance);
    document.getElementById('total-income').textContent = formatCurrency(income);
    document.getElementById('total-expenses').textContent = formatCurrency(expenses);
}

// Show transaction form
function showAddTransactionForm() {
    // Reset form
    document.getElementById('transaction-form').reset();
    document.getElementById('transaction-id').value = '';
    document.getElementById('transaction-form-title').textContent = 'Add Transaction';

    // Set default date to today
    document.getElementById('transaction-date').valueAsDate = new Date();

    // Update category options
    updateCategoryOptions();

    // Show form
    document.getElementById('transaction-form-container').classList.add('active');
}

// Hide transaction form
function hideTransactionForm() {
    document.getElementById('transaction-form-container').classList.remove('active');
}

// Handle transaction form submit
function handleTransactionFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const id = document.getElementById('transaction-id').value;
    const type = document.getElementById('transaction-type').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const category = document.getElementById('transaction-category').value;
    const date = new Date(document.getElementById('transaction-date').value);
    const description = document.getElementById('transaction-description').value;

    if (id) {
        // Update existing transaction
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { id, type, amount, category, date, description };
        }
    } else {
        // Add new transaction
        transactions.push({
            id: generateId(),
            type,
            amount,
            category,
            date,
            description
        });
    }

    // Save and update UI
    saveToLocalStorage();
    updateUI();
    hideTransactionForm();

    // If we're on the dashboard, render it again
    if (activeSectionId === 'dashboard') {
        renderDashboard();
    }
}

// Show edit transaction form
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    document.getElementById('transaction-id').value = transaction.id;
    document.getElementById('transaction-type').value = transaction.type;
    document.getElementById('transaction-amount').value = transaction.amount;

    // Set the correct date
    const dateInput = document.getElementById('transaction-date');
    const year = transaction.date.getFullYear();
    const month = String(transaction.date.getMonth() + 1).padStart(2, '0');
    const day = String(transaction.date.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;

    document.getElementById('transaction-description').value = transaction.description;

    // Update categories based on type
    updateCategoryOptions();
    document.getElementById('transaction-category').value = transaction.category;

    document.getElementById('transaction-form-title').textContent = 'Edit Transaction';
    document.getElementById('transaction-form-container').classList.add('active');
}

// Delete transaction
function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions.splice(index, 1);
        saveToLocalStorage();
        updateUI();

        // If we're on the dashboard, render it again
        if (activeSectionId === 'dashboard') {
            renderDashboard();
        }
    }
}

// Render transactions table
function renderTransactionsTable() {
    const tableBody = document.getElementById('transactions-data');
    const emptyState = document.getElementById('no-transactions');

    // Clear table
    tableBody.innerHTML = '';

    // Apply filters
    const filteredTransactions = getFilteredTransactions();

    if (filteredTransactions.length === 0) {
        // Show empty state
        emptyState.classList.remove('hidden');
        return;
    }

    // Hide empty state
    emptyState.classList.add('hidden');

    // Sort transactions by date (newest first)
    filteredTransactions
        .sort((a, b) => b.date - a.date)
        .forEach(transaction => {
            const row = document.createElement('tr');

            // Date column
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDate(transaction.date);
            row.appendChild(dateCell);

            // Description column
            const descCell = document.createElement('td');
            descCell.textContent = transaction.description;
            row.appendChild(descCell);

            // Category column
            const catCell = document.createElement('td');
            catCell.textContent = transaction.category;
            row.appendChild(catCell);

            // Amount column
            const amountCell = document.createElement('td');
            amountCell.textContent = formatCurrency(transaction.amount);
            amountCell.classList.add(transaction.type === 'income' ? 'amount-positive' : 'amount-negative');
            row.appendChild(amountCell);

            // Actions column
            const actionsCell = document.createElement('td');

            const editBtn = document.createElement('button');
            editBtn.classList.add('btn', 'icon-btn');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => editTransaction(transaction.id));
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'icon-btn');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteTransaction(transaction.id));
            actionsCell.appendChild(deleteBtn);

            row.appendChild(actionsCell);

            tableBody.appendChild(row);
        });
}

// Get filtered transactions based on current filter settings
function getFilteredTransactions() {
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const dateFilter = document.getElementById('filter-date').value;

    return transactions.filter(transaction => {
        // Type filter
        if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && transaction.category !== categoryFilter) return false;

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const transactionDate = transaction.date;

            if (dateFilter === 'this-month') {
                if (transactionDate.getMonth() !== now.getMonth() ||
                    transactionDate.getFullYear() !== now.getFullYear()) {
                    return false;
                }
            } else if (dateFilter === 'last-month') {
                const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

                if (transactionDate.getMonth() !== lastMonth ||
                    transactionDate.getFullYear() !== lastMonthYear) {
                    return false;
                }
            } else if (dateFilter === 'this-year') {
                if (transactionDate.getFullYear() !== now.getFullYear()) {
                    return false;
                }
            } else if (dateFilter === 'custom') {
                const fromDate = new Date(document.getElementById('date-from').value);
                const toDate = new Date(document.getElementById('date-to').value);
                toDate.setHours(23, 59, 59, 999); // Include the entire day

                if (transactionDate < fromDate || transactionDate > toDate) {
                    return false;
                }
            }
        }

        return true;
    });
}

// Handle date filter change
function handleDateFilterChange() {
    const dateFilter = document.getElementById('filter-date').value;
    const customDateRange = document.getElementById('custom-date-range');

    if (dateFilter === 'custom') {
        customDateRange.classList.remove('hidden');

        // Set default date range to current month if not already set
        if (!document.getElementById('date-from').value) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Format dates for input
            const formatForInput = (date) => {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            };

            document.getElementById('date-from').value = formatForInput(firstDay);
            document.getElementById('date-to').value = formatForInput(lastDay);
        }
    } else {
        customDateRange.classList.add('hidden');
    }

    applyTransactionFilters();
}

// Apply transaction filters
function applyTransactionFilters() {
    renderTransactionsTable();
}

// Show budget form
function showAddBudgetForm() {
    // Reset form
    document.getElementById('budget-form').reset();
    document.getElementById('budget-id').value = '';
    document.getElementById('budget-form-title').textContent = 'Create Budget';

    // Populate expense categories
    populateCategorySelects();

    // Show form
    document.getElementById('budget-form-container').classList.add('active');
}

// Hide budget form
function hideBudgetForm() {
    document.getElementById('budget-form-container').classList.remove('active');
}

// Handle budget form submit
function handleBudgetFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const id = document.getElementById('budget-id').value;
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);

    if (id) {
        // Update existing budget
        const index = budgets.findIndex(b => b.id === id);
        if (index !== -1) {
            budgets[index] = { id, category, amount };
        }
    } else {
        // Check if budget for this category already exists
        const existingBudgetIndex = budgets.findIndex(b => b.category === category);

        if (existingBudgetIndex !== -1) {
            // Update existing budget
            budgets[existingBudgetIndex].amount = amount;
        } else {
            // Add new budget
            budgets.push({
                id: generateId(),
                category,
                amount
            });
        }
    }

    // Save and update UI
    saveToLocalStorage();
    renderBudgets();
    renderBudgetStatus();
    hideBudgetForm();
}

// Show edit budget form
function editBudget(id) {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;

    document.getElementById('budget-id').value = budget.id;
    document.getElementById('budget-amount').value = budget.amount;

    // Populate category selects first
    populateCategorySelects();
    document.getElementById('budget-category').value = budget.category;

    document.getElementById('budget-form-title').textContent = 'Edit Budget';
    document.getElementById('budget-form-container').classList.add('active');
}

// Delete budget
function deleteBudget(id) {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
        budgets.splice(index, 1);
        saveToLocalStorage();
        renderBudgets();
        renderBudgetStatus();
    }
}

// Render budgets list
function renderBudgets() {
    const budgetsContainer = document.getElementById('budget-items');
    const emptyState = document.getElementById('no-budgets');

    // Clear container
    budgetsContainer.innerHTML = '';

    if (budgets.length === 0) {
        // Show empty state
        emptyState.classList.remove('hidden');
        return;
    }

    // Hide empty state
    emptyState.classList.add('hidden');

    // Sort budgets alphabetically by category
    budgets
        .sort((a, b) => a.category.localeCompare(b.category))
        .forEach(budget => {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            // Calculate amount spent in this category this month
            const spent = transactions
                .filter(t => t.type === 'expense' &&
                    t.category === budget.category &&
                    t.date.getMonth() === currentMonth &&
                    t.date.getFullYear() === currentYear)
                .reduce((sum, t) => sum + t.amount, 0);

            // Calculate percentage
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            const remaining = budget.amount - spent;

            // Create budget card
            const card = document.createElement('div');
            card.classList.add('budget-card');

            // Determine status color
            let statusClass = 'progress-normal';
            if (percentage >= 75 && percentage < 100) {
                statusClass = 'progress-warning';
            } else if (percentage >= 100) {
                statusClass = 'progress-danger';
            }

            card.innerHTML = `
                <div class="budget-card-header">
                    <h3 class="budget-card-title">${budget.category}</h3>
                    <div class="budget-actions">
                        <button class="btn icon-btn edit-budget" data-id="${budget.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn icon-btn delete-budget" data-id="${budget.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="budget-limit">${formatCurrency(budget.amount)}</div>
                <div class="budget-progress">
                    <div class="budget-progress-fill ${statusClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-stats">
                    <span>${formatCurrency(spent)} spent</span>
                    <span>${formatCurrency(remaining)} remaining</span>
                </div>
            `;

            // Add event listeners to buttons
            budgetsContainer.appendChild(card);

            // Add event listeners
            card.querySelector('.edit-budget').addEventListener('click', function () {
                editBudget(this.getAttribute('data-id'));
            });

            card.querySelector('.delete-budget').addEventListener('click', function () {
                deleteBudget(this.getAttribute('data-id'));
            });
        });
}

// Render budget status indicators on dashboard
function renderBudgetStatus() {
    const budgetIndicators = document.getElementById('budget-indicators');

    // Clear container
    budgetIndicators.innerHTML = '';

    if (budgets.length === 0) {
        budgetIndicators.innerHTML = '<p class="empty-message">No budgets created yet</p>';
        return;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Sort budgets by percentage spent (highest first)
    budgets
        .map(budget => {
            // Calculate amount spent in this category this month
            const spent = transactions
                .filter(t => t.type === 'expense' &&
                    t.category === budget.category &&
                    t.date.getMonth() === currentMonth &&
                    t.date.getFullYear() === currentYear)
                .reduce((sum, t) => sum + t.amount, 0);

            // Calculate percentage
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

            return { ...budget, spent, percentage };
        })
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5) // Show top 5 budgets
        .forEach(budget => {
            // Determine status color
            let statusClass = 'progress-normal';
            if (budget.percentage >= 75 && budget.percentage < 100) {
                statusClass = 'progress-warning';
            } else if (budget.percentage >= 100) {
                statusClass = 'progress-danger';
            }

            const budgetItem = document.createElement('div');
            budgetItem.classList.add('budget-item');

            budgetItem.innerHTML = `
                <div class="budget-item-header">
                    <h4>${budget.category}</h4>
                    <span>${Math.round(budget.percentage)}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar ${statusClass}" style="width: ${Math.min(budget.percentage, 100)}%"></div>
                </div>
                <div class="budget-details">
                    <span>${formatCurrency(budget.spent)} of ${formatCurrency(budget.amount)}</span>
                    <span>${formatCurrency(budget.amount - budget.spent)} left</span>
                </div>
            `;

            budgetIndicators.appendChild(budgetItem);
        });
}

// Render recent transactions on dashboard
function renderRecentTransactions() {
    const transactionsList = document.getElementById('recent-transactions-list');

    // Clear container
    transactionsList.innerHTML = '';

    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-message">No transactions recorded yet</p>';
        return;
    }

    // Get 5 most recent transactions
    transactions
        .sort((a, b) => b.date - a.date)
        .slice(0, 5)
        .forEach(transaction => {
            const item = document.createElement('div');
            item.classList.add('transaction-item');

            item.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-icon ${transaction.type === 'income' ? 'income-icon' : 'expense-icon'}">
                        <i class="fas fa-${transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${formatDate(transaction.date)} • ${transaction.category}</p>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}">
                    ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                </div>
            `;

            transactionsList.appendChild(item);
        });
}

// Render dashboard charts
function renderDashboard() {
    updateSummaryCards();
    renderRecentTransactions();
    renderBudgetStatus();
    renderExpenseChart();
    renderComparisonChart();
}

// Render expense breakdown chart
function renderExpenseChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');

    // Get expense categories and amounts for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const expensesByCategory = {};

    transactions
        .filter(t => t.type === 'expense' &&
            t.date.getMonth() === currentMonth &&
            t.date.getFullYear() === currentYear)
        .forEach(transaction => {
            if (!expensesByCategory[transaction.category]) {
                expensesByCategory[transaction.category] = 0;
            }
            expensesByCategory[transaction.category] += transaction.amount;
        });

    const categories = Object.keys(expensesByCategory);
    const amounts = categories.map(category => expensesByCategory[category]);

    // Define chart colors
    const backgroundColors = [
        'rgba(94, 114, 228, 0.7)',
        'rgba(45, 206, 137, 0.7)',
        'rgba(251, 99, 64, 0.7)',
        'rgba(245, 54, 92, 0.7)',
        'rgba(58, 196, 125, 0.7)',
        'rgba(41, 128, 185, 0.7)',
        'rgba(142, 68, 173, 0.7)',
        'rgba(230, 126, 34, 0.7)',
        'rgba(149, 165, 166, 0.7)',
        'rgba(52, 73, 94, 0.7)'
    ];

    // Check if we have an existing chart and destroy it
    if (window.expenseChart) {
        window.expenseChart.destroy();
    }

    if (categories.length === 0) {
        // No data to show
        document.getElementById('expense-chart').parentElement.innerHTML =
            '<div class="no-data-message">No expense data for this month</div>';
        return;
    }

    // Create chart
    window.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: backgroundColors.slice(0, categories.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Render income vs expense chart
function renderComparisonChart() {
    const ctx = document.getElementById('comparison-chart').getContext('2d');

    // Get monthly data for the last 6 months
    const monthlyData = [];
    const labels = [];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        const monthYear = month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        const income = transactions
            .filter(t => t.type === 'income' &&
                t.date.getMonth() === month.getMonth() &&
                t.date.getFullYear() === month.getFullYear())
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'expense' &&
                t.date.getMonth() === month.getMonth() &&
                t.date.getFullYear() === month.getFullYear())
            .reduce((sum, t) => sum + t.amount, 0);

        monthlyData.push({ income, expenses });
        labels.push(monthYear);
    }

    // Check if we have an existing chart and destroy it
    if (window.comparisonChart) {
        window.comparisonChart.destroy();
    }

    // Create chart
    window.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: monthlyData.map(d => d.income),
                    backgroundColor: 'rgba(45, 206, 137, 0.7)',
                    borderColor: 'rgba(45, 206, 137, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: monthlyData.map(d => d.expenses),
                    backgroundColor: 'rgba(251, 99, 64, 0.7)',
                    borderColor: 'rgba(251, 99, 64, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Handle timeframe change in reports
function handleReportTimeframeChange() {
    const timeframe = document.getElementById('report-timeframe').value;
    const monthSelectContainer = document.getElementById('month-select-container');

    // Show/hide month selector based on timeframe
    if (timeframe === 'daily') {
        // For daily view, we need month select
        monthSelectContainer.style.display = 'block';
    } else if (timeframe === 'yearly') {
        // For yearly view, we don't need month select
        monthSelectContainer.style.display = 'none';
    } else {
        // For monthly view, show month select
        monthSelectContainer.style.display = 'block';
    }

    updateReports();
}

// Populate year select with available years
function populateYearSelect() {
    const yearSelect = document.getElementById('report-year');

    // Clear existing options
    yearSelect.innerHTML = '';

    // Get all years from transactions
    let years = transactions.map(t => t.date.getFullYear());

    // Add current year if not in the list
    const currentYear = new Date().getFullYear();
    if (!years.includes(currentYear)) {
        years.push(currentYear);
    }

    // Get unique years and sort
    years = [...new Set(years)].sort((a, b) => b - a);

    // Add years to select
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Set current year as default
    yearSelect.value = currentYear;
}

// Update reports based on selected filters
function updateReports() {
    const timeframe = document.getElementById('report-timeframe').value;
    const month = parseInt(document.getElementById('report-month').value);
    const year = parseInt(document.getElementById('report-year').value);

    // Update chart titles based on timeframe
    if (timeframe === 'daily') {
        document.getElementById('trends-chart-title').textContent =
            `Daily Spending in ${new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else if (timeframe === 'monthly') {
        document.getElementById('trends-chart-title').textContent = 'Monthly Spending Trends';
    } else { // yearly
        document.getElementById('trends-chart-title').textContent = 'Yearly Spending Overview';
    }

    renderTrendsChart(timeframe, month, year);
    renderCategoryChart(timeframe, month, year);
    renderIncomeExpenseChart(timeframe, month, year);
    renderSummaryTable(timeframe, month, year);
}

// Render trends chart
function renderTrendsChart(timeframe, month, year) {
    const ctx = document.getElementById('trends-chart').getContext('2d');

    // Check if we have an existing chart and destroy it
    if (window.trendsChart) {
        window.trendsChart.destroy();
    }

    let labels = [];
    let expenseData = [];

    if (timeframe === 'daily') {
        // Daily data for selected month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            labels.push(day);

            const dayExpenses = transactions
                .filter(t => t.type === 'expense' &&
                    t.date.getDate() === day &&
                    t.date.getMonth() === month &&
                    t.date.getFullYear() === year)
                .reduce((sum, t) => sum + t.amount, 0);

            expenseData.push(dayExpenses);
        }
    } else if (timeframe === 'monthly') {
        // Monthly data for selected year
        for (let m = 0; m < 12; m++) {
            const monthName = new Date(year, m, 1).toLocaleDateString('en-US', { month: 'short' });
            labels.push(monthName);

            const monthExpenses = transactions
                .filter(t => t.type === 'expense' &&
                    t.date.getMonth() === m &&
                    t.date.getFullYear() === year)
                .reduce((sum, t) => sum + t.amount, 0);

            expenseData.push(monthExpenses);
        }
    } else { // yearly
        // Get all years from transactions
        const years = [...new Set(transactions.map(t => t.date.getFullYear()))].sort();

        years.forEach(y => {
            labels.push(y.toString());

            const yearExpenses = transactions
                .filter(t => t.type === 'expense' && t.date.getFullYear() === y)
                .reduce((sum, t) => sum + t.amount, 0);

            expenseData.push(yearExpenses);
        });
    }

    // Create chart
    window.trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: expenseData,
                borderColor: 'rgba(251, 99, 64, 1)',
                backgroundColor: 'rgba(251, 99, 64, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Render category breakdown chart
function renderCategoryChart(timeframe, month, year) {
    const ctx = document.getElementById('category-chart').getContext('2d');

    // Filter transactions based on timeframe
    let filteredTransactions = transactions.filter(t => t.type === 'expense');

    if (timeframe === 'daily' || timeframe === 'monthly') {
        // For daily and monthly, filter by month and year
        filteredTransactions = filteredTransactions.filter(
            t => t.date.getMonth() === month && t.date.getFullYear() === year
        );
    } else { // yearly
        // For yearly, filter by year only
        filteredTransactions = filteredTransactions.filter(
            t => t.date.getFullYear() === year
        );
    }

    // Group by category
    const expensesByCategory = {};
    filteredTransactions.forEach(transaction => {
        if (!expensesByCategory[transaction.category]) {
            expensesByCategory[transaction.category] = 0;
        }
        expensesByCategory[transaction.category] += transaction.amount;
    });

    const categories = Object.keys(expensesByCategory).sort();
    const amounts = categories.map(category => expensesByCategory[category]);

    // Define chart colors
    const backgroundColors = [
        'rgba(94, 114, 228, 0.7)',
        'rgba(45, 206, 137, 0.7)',
        'rgba(251, 99, 64, 0.7)',
        'rgba(245, 54, 92, 0.7)',
        'rgba(58, 196, 125, 0.7)',
        'rgba(41, 128, 185, 0.7)',
        'rgba(142, 68, 173, 0.7)',
        'rgba(230, 126, 34, 0.7)',
        'rgba(149, 165, 166, 0.7)',
        'rgba(52, 73, 94, 0.7)'
    ];

    // Check if we have an existing chart and destroy it
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }

    if (categories.length === 0) {
        // No data to show
        document.getElementById('category-chart').parentElement.innerHTML =
            '<div class="no-data-message">No expense data for this period</div>';
        return;
    }

    // Create chart
    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: backgroundColors.slice(0, categories.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Render income vs expense comparison chart
function renderIncomeExpenseChart(timeframe, month, year) {
    const ctx = document.getElementById('income-expense-chart').getContext('2d');

    // Filter transactions based on timeframe
    let filteredTransactions = transactions;

    if (timeframe === 'daily' || timeframe === 'monthly') {
        // For daily and monthly, filter by month and year
        filteredTransactions = filteredTransactions.filter(
            t => t.date.getMonth() === month && t.date.getFullYear() === year
        );
    } else { // yearly
        // For yearly, filter by year only
        filteredTransactions = filteredTransactions.filter(
            t => t.date.getFullYear() === year
        );
    }

    // Calculate totals
    const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Check if we have an existing chart and destroy it
    if (window.incomeExpenseChart) {
        window.incomeExpenseChart.destroy();
    }

    // Create chart
    window.incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [income, expenses],
                backgroundColor: [
                    'rgba(45, 206, 137, 0.7)',
                    'rgba(251, 99, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(45, 206, 137, 1)',
                    'rgba(251, 99, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Render summary table
function renderSummaryTable(timeframe, month, year) {
    const tableBody = document.getElementById('summary-data');
    const totalElement = document.getElementById('summary-total');

    // Clear table
    tableBody.innerHTML = '';

    // Filter transactions based on timeframe
    let filteredTransactions = transactions.filter(t => t.type === 'expense');

    if (timeframe === 'daily' || timeframe === 'monthly') {
        // For daily and monthly, filter by month and year
        filteredTransactions = filteredTransactions.filter(
            t => t.date.getMonth() === month && t.date.getFullYear() === year
        );
    } else { // yearly
        // For yearly, filter by year only
        filteredTransactions = filteredTransactions.filter(
            t => t.date.getFullYear() === year
        );
    }

    // Group by category
    const expensesByCategory = {};
    filteredTransactions.forEach(transaction => {
        if (!expensesByCategory[transaction.category]) {
            expensesByCategory[transaction.category] = 0;
        }
        expensesByCategory[transaction.category] += transaction.amount;
    });

    // Calculate total expenses
    const totalExpenses = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Sort categories by amount (highest first)
    const sortedCategories = Object.keys(expensesByCategory).sort(
        (a, b) => expensesByCategory[b] - expensesByCategory[a]
    );

    // Generate table rows
    sortedCategories.forEach(category => {
        const amount = expensesByCategory[category];
        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

        const row = document.createElement('tr');

        const categoryCell = document.createElement('td');
        categoryCell.textContent = category;
        row.appendChild(categoryCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = formatCurrency(amount);
        row.appendChild(amountCell);

        const percentageCell = document.createElement('td');
        percentageCell.textContent = percentage.toFixed(1) + '%';
        row.appendChild(percentageCell);

        tableBody.appendChild(row);
    });

    // Update total
    totalElement.textContent = formatCurrency(totalExpenses);

    // Show empty state if no data
    if (sortedCategories.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.setAttribute('colspan', '3');
        emptyCell.textContent = 'No expense data for this period';
        emptyCell.style.textAlign = 'center';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
    }
}

// Set up mobile menu with improved header
function setupMobileMenu() {
    // Create mobile header
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobile-header';

    // Create mobile logo
    const mobileLogo = document.createElement('div');
    mobileLogo.className = 'mobile-logo';
    mobileLogo.innerHTML = '<i class="fas fa-wallet"></i><h1>BudgetTrack</h1>';

    // Create menu toggle button
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';

    // Append elements to mobile header
    mobileHeader.appendChild(mobileLogo);
    mobileHeader.appendChild(menuToggle);

    // Create overlay
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';

    // Add elements to the body
    document.body.insertBefore(mobileHeader, document.body.firstChild);
    document.body.appendChild(menuOverlay);

    // Toggle menu on button click
    menuToggle.addEventListener('click', function () {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    // Close menu when clicking overlay
    menuOverlay.addEventListener('click', function () {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('active');
        menuOverlay.classList.remove('active');
    });

    // Close menu when clicking a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.remove('active');
                menuOverlay.classList.remove('active');
            }
        });
    });

    // Add touch gesture support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const sidebar = document.querySelector('.sidebar');

        // Swipe right to open menu (when starting near the edge)
        if (touchEndX - touchStartX > 100 && touchStartX < 50) {
            sidebar.classList.add('active');
            menuOverlay.classList.add('active');
        }

        // Swipe left to close menu
        if (touchStartX - touchEndX > 100 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            menuOverlay.classList.remove('active');
        }
    }
}
