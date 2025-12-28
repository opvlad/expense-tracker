'use strict';

import { getExpenses, createExpense, deleteExpense, changeExpense } from "./api.js";
import { renderPagination, renderTable, renderTableTools, makeCellEditable } from "./ui.js";
import { showError, transformKeys } from "./utils.js";
import currentState from "./state.js";


window.addEventListener('DOMContentLoaded', () => {

    const tableRows = document.querySelector('#expense-list'),
          tableHead = document.querySelector('#expense-table-head'),

          expenseForm = document.querySelector('#expense-form'),
          createTotalBtn = document.querySelector('#get-total-btn'),

          limitRowsSelect = document.querySelector('#limitSelect'),

          openFiltersModalBtn = document.querySelector('#select-filters'),
          filterForm = document.querySelector('#filter-form'),
          filterModal = document.querySelector('#filter-modal'),
          filterModalBootstrap = bootstrap.Modal.getOrCreateInstance(filterModal),
          closeFilterModalBtn = filterModal.querySelector('#close-modal-filters-btn'),
          clearFiltersModalBtn = filterModal.querySelector('#clear-filters-btn'),
          resetFiltersBtn = document.querySelector('#reset-filters-btn'),

          previousPageBtn = document.querySelector('#previous-page-btn'),
          nextPageBtn = document.querySelector('#next-page-btn');


    resetFiltersBtn.addEventListener('click', () => {
        filterForm.reset();
        currentState.reset();
        resetFiltersBtn.style.display = 'none';
        updateTable();
    });

    openFiltersModalBtn.addEventListener('click', () => {
        filterModalBootstrap.show();
    });

    clearFiltersModalBtn.addEventListener('click', () => {
        filterForm.reset();
    });

    closeFilterModalBtn.addEventListener('click', () => {
        document.activeElement.blur();
        filterModalBootstrap.hide();
    });
    
    filterForm.addEventListener('submit', handleApplyFilters);


    limitRowsSelect.addEventListener('change', () => {
        currentState.setLimit(limitRowsSelect.value);
        updateTable();
    });

    tableHead.addEventListener('click', handleApplySorting);

    tableRows.addEventListener('click', (event) => {
        const target = event.target;

        if (target && target.classList.contains('delete-btn')) {
            handleDeleteExpenseClick(target);
        }

        else if (target && target.classList.contains('row-checkbox')) {
            target.closest('tr').classList.toggle('selected');
        }
        
        else if (target && target.closest('td') && !target.matches('input, select, .note, .action')) {
            handleChangeCell(target);
        }
    });


    expenseForm.addEventListener('submit', handleCreateExpense);

    createTotalBtn.addEventListener('click', handleCreateTotal);

    previousPageBtn.addEventListener('click', () => {
        if (currentState.page > 1) {
            currentState.page--;
            updateTable();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentState.page < currentState.totalPages) {
            currentState.page++;
            updateTable();
        }
    });

    async function updateTable() {
        const res = await getExpenses(currentState.getQueryParams());

        if (!res.ok) {
            showError('Сталася помилка під час завантаження таблиця. Спробуйте пізніше');
            return;
        }
        const expenses = res.data;
        
        currentState.totalPages = res.json.totalPages;
        currentState.page = res.json.currentPage;

        renderTable(expenses);

        renderPagination(currentState.page, currentState.totalPages, (newPage) => {
            currentState.page = newPage;
        }, updateTable);
    }

    function handleApplyFilters(event) {
        event.preventDefault();

        const resetFiltersBtn = document.querySelector('#reset-filters-btn');
        const modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#filter-modal'));
        const formData = new FormData(filterForm);
        const fromObj = Object.fromEntries(formData.entries());
        const params = {};


        for (const [key, value] of Object.entries(fromObj)) {
            if (value) {
                params[key] = value;
            }
        } 

        const transformedParams = transformKeys(params);

        currentState.setParams(transformedParams);

        resetFiltersBtn.style.display = 'block';
        document.activeElement.blur();
        modal.hide();

        updateTable();
    }

    function handleApplySorting(event) {
        const th = event.target.closest('th');

        if (th && th.closest('th') && !th.matches('.col-action') && !th.matches('.col-note')) {
            const thClasses = th.classList,
                  theads = document.querySelectorAll('th');
        
            theads.forEach(item => {
                if (item !== th) {
                    item.classList.remove('asc', 'desc');
                }
            });

            let sort;
            if (thClasses.contains('desc')) {
                thClasses.remove('desc');
                thClasses.add('asc');
                    sort = `${th.dataset.type}`
            }
            else if (thClasses.contains('asc')) {
                thClasses.remove('asc');
            }
            else {
                thClasses.add('desc');
                sort = `-${th.dataset.type}`
            }
            
            currentState.sort = sort;

            updateTable();
        }
    }

    async function handleDeleteExpenseClick(target) {
        const expenseId = target.closest('tr').dataset.id,
                  res = await deleteExpense(expenseId);

        if (!res.ok) {
            showError('Сталася помилка під час видалення витрати. Спробуйте пізніше')
        }

        updateTable();
    }

    function handleChangeCell(target, ) {
        const value = target.matches('select') ? target.value : target.textContent,
                td = target.closest('td'),
                originalTdHtml = td.innerHTML;

        const cell = makeCellEditable(td, value);
        cell.focus();
        cell.value = '';
        setTimeout(() => cell.value = value, 20);

        cell.addEventListener('change', async (event) => {

            const newValue = event.target.value,
                    expenseId = event.target.closest('tr').dataset.id,
                    key = td.classList[0],
                    update = {[key]: newValue};
                
            const res = await changeExpense(expenseId, update);

            if (!res.ok) {
                showError('Сталася помилка під час зміни витрати. Спробуйте пізніше');
            }

            updateTable();
        });

        cell.addEventListener('blur', () => {
            td.innerHTML = originalTdHtml;
        });
    }

    async function handleCreateExpense(event) {
        event.preventDefault();
        
        const formData = new FormData(expenseForm),
              expense = Object.fromEntries(formData);
              
        expense.date = expense.date ? new Date(expense.date) : new Date();
        
        const res = await createExpense(expense);

        if (!res.ok) {
            showError('Сталась помилка, можливо ви обрали неіснуючу категорію');
            return;
        } 

        expenseForm.reset();
        updateTable();
    }

    async function handleCreateTotal() {
        const rows = document.querySelectorAll('tr'),
              selectedRows = [];
        
        rows.forEach(row => {
            if (row.classList.contains('selected')) selectedRows.push(row);
        });

        if (selectedRows.length === 0) {
            showError('Будь ласка, оберіть витрати, за якими бажаєте зробити підсумок');
            return;
        }

        const inputDate = document.querySelector('.input-date').value,
              inputTitle = document.querySelector('.input-title').value,
              inputNote = document.querySelector('.input-note').value;

        const title = inputTitle ? inputTitle : 'Новий підсумок';

        const totalSum = selectedRows.reduce((acc, curr) => {
            const amount = curr.querySelector('.amount').textContent.split(' ')[0];

            return acc + parseFloat(amount);
        }, 0);

        const total = {
            date: inputDate ? new Date(inputDate) : new Date(),
            category: 'Підсумок',
            title: title,
            amount: totalSum,
            note: inputNote
        };

        const res = await createExpense(total);

        if (!res.ok) {
            showError('Сталась помилка, можливо ви обрали неіснуючу категорію');
            return;
        } 

        expenseForm.reset();
        updateTable();
    }

    updateTable();
    renderTableTools(currentState.limit);
});
