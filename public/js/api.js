import qs from 'https://cdn.skypack.dev/qs';
import { API_URL } from "./config.js";


async function request(url, method = 'GET', body = null) {
    const headers = { 'Content-type': 'application/json' };
    const config = { method, headers };

    if (body) config.body = JSON.stringify(body);
    const res = await fetch(url, config);

    if (!res.ok) {
        const json = await res.json();
        const serverError = json.error;

        const error = new Error(serverError.message || 'Something went wrong');
        error.name = serverError.name || 'Unknowledged error';
        error.status = res.status;
        error.details = serverError;

        throw error;
    }

    return res.json();
}

async function safeRequest(func) {
    try {
        const json = await func();

        return { ok: true, data: json.data, json: json };
    } catch (error) {
        console.log(error);
        return { ok: false, error: error };
    }
}

// return [{_id, title, amount, createdAt, __v}] or []
export async function getExpenses(params = {}) {
    const searchParams = qs.stringify(params);
    const url = `${API_URL}?${searchParams}`;
    return safeRequest(() => request(url));
}

export async function createExpense(expense) {
    return safeRequest(() => request(API_URL, 'POST', expense));
}

export async function deleteExpense(expenseId) {
    const url = `${API_URL}${expenseId}`;
    return safeRequest(() => request(url, 'DELETE'));
}

export async function changeExpense(expenseId, data) {
    const url = `${API_URL}${expenseId}`;
    return safeRequest(() => request(API_URL + expenseId, 'PATCH', data));
}
