"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const isEmpty_1 = __importDefault(require("lodash/isEmpty"));
const useForm = ({ defaultValues = {}, onSubmit = (values) => { }, requireds = [''], requiresValidation = [''], disableKeyListener = false }) => {
    const [errors, handleErrors] = (0, react_1.useState)({});
    const [valids, handleValids] = (0, react_1.useState)({});
    const [values, setValues] = (0, react_1.useState)(defaultValues || {});
    const handleSubmit = (event) => {
        if (event)
            event.preventDefault();
        const errs = {};
        requireds.forEach((name) => {
            if (!values[name])
                errs[name] = 'This field is mandatory.';
        });
        requiresValidation.forEach(name => standardValidation[name](values[name]));
        handleErrors(Object.assign(Object.assign({}, errors), errs));
        if ((0, isEmpty_1.default)(errors) && (0, isEmpty_1.default)(errs)) {
            onSubmit(values);
        }
    };
    const handleChange = (event) => {
        const target = event.target;
        if (event.persist)
            event.persist();
        setValues(Object.assign(Object.assign({}, values), { [target.name]: target.value }));
        const _a = errors, _b = target.name, deleted = _a[_b], errs = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
        handleErrors(Object.assign({}, errs));
        handleValids(values.confirmPassword
            ? Object.assign(Object.assign({}, valids), { [target.name]: null, confirmPassword: null }) : Object.assign(Object.assign({}, valids), { [target.name]: null }));
    };
    const handleChangeCheckbox = (event) => {
        const target = event.target;
        if (event.persist)
            event.persist();
        setValues((values) => (Object.assign(Object.assign({}, values), { [target.name]: target.checked })));
    };
    const handleChangeRadio = (fieldName, fieldValue) => {
        if (values[fieldName] !== fieldValue) {
            setValues((values) => (Object.assign(Object.assign({}, values), { [fieldName]: fieldValue })));
        }
    };
    const handleBlur = (e) => {
        const target = e.target;
        const _a = errors, _b = target.name, deleted = _a[_b], errs = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
        if (requireds.includes(target.name) && !target.value) {
            handleErrors(Object.assign(Object.assign({}, errs), { [target.name]: 'This field is mandatory.' }));
        }
        else if (requiresValidation.includes(target.name) &&
            standardValidation[target.name]) {
            standardValidation[target.name](target.value);
        }
        else {
            handleErrors(errs);
            handleValids(Object.assign(Object.assign({}, valids), { [target.name]: true }));
        }
    };
    const handleFileUpload = (event) => {
        const target = event.target;
        const { files } = target;
        const newFormState = Object.assign({}, values);
        if (!newFormState[target.name]) {
            newFormState[target.name] = [];
        }
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.onload = (function () {
                    newFormState[target.name] = [
                        ...newFormState[target.name],
                        reader.result
                    ];
                    return setValues(newFormState);
                })();
                reader.readAsDataURL(files[i]);
            }
        }
    };
    const validated = (fieldName) => {
        const _a = errors, _b = fieldName, value = _a[_b], errs = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
        handleErrors(Object.assign({}, errs));
        handleValids(Object.assign(Object.assign({}, valids), { [fieldName]: true }));
    };
    const denied = (fieldName, message) => {
        handleErrors(Object.assign(Object.assign({}, errors), { [fieldName]: message }));
        handleValids(Object.assign(Object.assign({}, valids), { [fieldName]: false }));
    };
    const standardValidation = {
        phone: (value) => {
            if (/^(?:00|\+)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/.test(value)) {
                return validated('phone');
            }
            return denied('phone', 'Please use international format ("+XX" or "00XX" without spaces).');
        },
        email: (value) => {
            if (/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(value === null || value === void 0 ? void 0 : value.toLowerCase())) {
                return validated('email');
            }
            return denied('email', 'This does not look like a valid email address.');
        },
        password: (value) => {
            if (/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{7,})\S$/.test(value)) {
                return validated('password');
            }
            else {
                return denied('password', 'Passwords must contain at least 8 characters, 1 uppercase, 1 lowercase & 1 number.');
            }
        },
        confirmPassword: (value) => {
            if (values.password === value) {
                return validated('confirmPassword');
            }
            return denied('confirmPassword', 'Passwords do not match.');
        }
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter')
            onSubmit();
    };
    (0, react_1.useEffect)(() => {
        if (!disableKeyListener) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [disableKeyListener]);
    return {
        errors,
        valids,
        values,
        standardValidation,
        setValues,
        handleErrors,
        handleValids,
        handleChange,
        handleBlur,
        handleChangeCheckbox,
        handleChangeRadio,
        handleFileUpload,
        handleSubmit
    };
};
exports.default = useForm;
