export function formatDate(date) {
    date = new Date(date);

    const formatterUA = new Intl.DateTimeFormat('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })

    return formatterUA.format(date);
}

export function showSuccess(message) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top", // bottom
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)", // Гарний градієнт
        },
        close: true,
        // onClick: function(){} // Подія при кліку
    }).showToast();
}

export function showError(message) {
    Toastify({
        text: message,
        duration: 5000,
        gravity: "top",
        position: "right",
        close: true,
        style: {
            background: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }
    }).showToast();
}

export function transformKeys(obj) {
    const map = {
        'Start': 'gte',
        'End': 'lt'
    };
    const keys = Object.keys(obj);
    const result = {};

    keys.forEach((key, i) => {
        key.replace(/^(\w+)(Start|End)$/, (match, fieldName, suffix) => {
            const newKey = `${fieldName}[${map[suffix]}]`;
            result[newKey] = obj[`${fieldName}${suffix}`];
            delete keys[i];
        });
    });

    keys.forEach(key => {
        result[key] = obj[key];
    });

    return result;
}
