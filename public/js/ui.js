import { formatDate } from "./utils.js";
import { categories } from "./config.js";

function getEmoji(category) {
    const emoji = {
        'Їжа': '🍔',
        'Транспорт': '🚌',
        'Житло': '🏠',
        'Розваги': '🎬',
        'Здоровʼя': '💊',
        'Інше': '⚙️',
        'Підсумок': '✅'
    };

    return emoji[category];
    // return `${emoji[category]} ${category}`
}

export async function renderTable(expenses) {
    const tbody = document.querySelector('#expense-list');

    tbody.innerHTML = '';    
    expenses.forEach(expense => {
        const tr = document.createElement('tr');

        expense.date = formatDate(expense.date);

        tr.innerHTML = `
            <td class="date" data-content-type="date">${expense.date}</td>
            <td class="category" data-content-type="text">
                <span class="cat-icon">${getEmoji(expense.category)}</span> 
                <span class="cat-text">${expense.category}</span>
            </td>
            <td class="title" data-content-type="text">${expense.title}</td>
            <td class="amount" data-content-type="number">${expense.amount}</td>
            <td class="note" data-content-type="text">${expense.note}</td>
            <td class="action delete"><button class="delete-btn">&times;</button></td> 
            <td class="action select">${expense.category === 'Підсумок' ? ' ' : '<input type="checkbox" class="row-checkbox">'}</td>
        `;3
        tr.dataset.id = expense.id;
        // tr.dataset.type = 'expense';

        if (expense.category === 'Підсумок') tr.classList.add('total-row')

        tbody.append(tr);
    });
}

export function renderPagination(currentPage, totalPages, changePage, updateTable) {
    const paginationCon = document.querySelector('#pagination-container'),
          prevBtn = paginationCon.querySelector('#previous-page-btn'),
          pagesInfo = paginationCon.querySelector('#pages-info'),
          nextBtn = paginationCon.querySelector('#next-page-btn');
    
    if (totalPages <= 1) {
        paginationCon.classList.add('d-none');
        return;
    } else {
        paginationCon.classList.remove('d-none');
    }

    prevBtn.disabled = currentPage === 1;

    pagesInfo.textContent = `Стор. ${currentPage} з ${totalPages}`;

    nextBtn.disabled = currentPage === totalPages;
}

export async function renderTableTools(limit) {
    const selectLimit = document.querySelector('#limitSelect');

    selectLimit.value = limit;
}

export function makeCellEditable(td, value) {
    if (td.classList.contains('category')) {
        const selectCategory = document.createElement('select');

        selectCategory.classList.add('data-changing');

        for (const [value, text] of Object.entries(categories)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            selectCategory.append(option);
        }

        td.innerHTML = '';
        td.append(selectCategory);
    } else {
        td.innerHTML = `<input type="${td.dataset.contentType}" value=${value} class="data-changing">`;
    }

    return document.querySelector('.data-changing');
}