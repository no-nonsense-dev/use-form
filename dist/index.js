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
const lodash_isempty_1 = __importDefault(require("lodash.isempty"));
const validation_1 = __importDefault(require("./validation"));
let values = {};
const setValues = (newVal) => (values = newVal);
const useForm = ({ defaultValues = {}, onSubmit = () => { }, requireds = [], bypassValidation = [], onKeyDown = null, disableKeyListener = false, customValidation = {} }) => {
    const [errors, handleErrors] = (0, react_1.useState)({});
    const [valids, handleValids] = (0, react_1.useState)({});
    const validation = Object.assign(Object.assign({}, (0, validation_1.default)(values)), customValidation);
    const validate = (fieldName, value) => {
        if (requireds.includes(fieldName) && (0, lodash_isempty_1.default)(value)) {
            handleErrors(Object.assign(Object.assign({}, errors), { [fieldName]: 'This field is mandatory.' }));
            return false;
        }
        else if (validation[fieldName] && !bypassValidation.includes(fieldName)) {
            if (validation[fieldName].test(value)) {
                const _a = errors, _b = fieldName, value = _a[_b], errs = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                handleErrors(Object.assign({}, errs));
                handleValids(Object.assign(Object.assign({}, valids), { [fieldName]: true }));
                return true;
            }
            else {
                if (validation[fieldName].error) {
                    handleErrors(Object.assign(Object.assign({}, errors), { [fieldName]: validation[fieldName].error }));
                }
                handleValids(Object.assign(Object.assign({}, valids), { [fieldName]: false }));
                return false;
            }
        }
        else
            return true;
    };
    const validateAll = () => {
        let errs = {};
        Object.keys(customValidation).forEach(fieldName => {
            var _a;
            if (!validate(fieldName, values[fieldName])) {
                errs[fieldName] = ((_a = validation[fieldName]) === null || _a === void 0 ? void 0 : _a.error) || 'Invalid value.';
            }
        });
        Object.entries(values).forEach(([name, value]) => {
            var _a;
            if (!validate(name, value))
                errs[name] = ((_a = validation[name]) === null || _a === void 0 ? void 0 : _a.error) || 'Invalid value.';
        });
        requireds.forEach(name => {
            if (!values[name])
                errs[name] = 'This field is mandatory.';
        });
        handleErrors(Object.assign(Object.assign({}, errors), errs));
        if ((0, lodash_isempty_1.default)(errs) && (0, lodash_isempty_1.default)(errors)) {
            return true;
        }
        else
            return false;
    };
    const handleSubmit = (event) => {
        if (event)
            event.preventDefault();
        if (validateAll()) {
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
        validate(target.name, values[target.name]);
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
    const handleKeyDown = (event) => onKeyDown
        ? onKeyDown(event)
        : event.key === 'Enter'
            ? handleSubmit(null)
            : null;
    (0, react_1.useEffect)(() => {
        if (!disableKeyListener) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [disableKeyListener, values]);
    (0, react_1.useEffect)(() => {
        if ((0, lodash_isempty_1.default)(values)) {
            setValues(defaultValues);
        }
        return () => {
            setValues({});
        };
    }, [values, defaultValues]);
    return {
        errors,
        valids,
        values,
        validate,
        validateAll,
        validation,
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
