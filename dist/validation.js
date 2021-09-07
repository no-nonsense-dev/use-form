"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const standardValidation = (values) => ({
    phone: {
        test: (value) => /^(?:00|\+)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/.test(value),
        error: 'Please use international format ("+XX" or "00XX" without spaces).'
    },
    email: {
        test: (value) => /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(value === null || value === void 0 ? void 0 : value.toLowerCase()),
        error: 'This does not look like a valid email address.'
    },
    password: {
        test: (value) => /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{7,})\S$/.test(value),
        error: 'Passwords must contain at least 8 characters, 1 uppercase, 1 lowercase & 1 number.'
    },
    confirmPassword: {
        test: (value) => values.password === value,
        error: 'Passwords do not match.'
    }
});
exports.default = standardValidation;
