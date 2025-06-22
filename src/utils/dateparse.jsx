const parseDate = (input) => {
    if (!input) return new Date(0); // very old default

    // Array format [y, m, d, hh?, mm?, ss?]
    if (Array.isArray(input)) {
        const [y, m, d, hh = 0, mm = 0, ss = 0] = input;
        return new Date(y, m - 1, d, hh, mm, ss);
    }

    if (typeof input === "string") {
        if (input.includes("/") && !input.includes("T")) {
            const [dStr, mStr, yStr] = input.split("/");
            const d = Number(dStr);
            const m = Number(mStr);
            const y = Number(yStr);
            if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
                return new Date(y, m - 1, d);
            }
        }
        // fallback ISO/date-string
        return new Date(input);
    }

    // fallback for unexpected types
    return new Date(input);
};

const formatDate = (input) => {
    if (!input) return "";

    let date;
    if (Array.isArray(input)) {
        const [y, m, d, hh = 0, mm = 0, ss = 0] = input;
        date = new Date(y, m - 1, d, hh, mm, ss);
    } else {
        date = new Date(input);
    }

    return date.toLocaleDateString("vi-VN");
};

export { parseDate, formatDate };
