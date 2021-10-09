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
exports.setForms = exports.forms = exports.standardValidation = void 0;
const react_1 = require("react");
const lodash_isempty_1 = __importDefault(require("lodash.isempty"));
const validation_1 = __importDefault(require("./validation"));
exports.standardValidation = validation_1.default;
let forms = {};
exports.forms = forms;
const setForms = (newVal, formName, prop) => (exports.forms = forms = Object.assign(Object.assign({}, forms), { [formName]: Object.assign(Object.assign({}, forms[formName]), { [prop]: newVal }) }));
exports.setForms = setForms;
const useForm = ({ defaultValues = {}, formName = 'UnnamedForm', onSubmit = () => { }, requireds = [], bypassValidation = [], onKeyDown = null, disableKeyListener = false, customValidation = {}, validateOnChange = [], validateOnBlur = [], validateOnSubmit = [], validateDefaultValuesOnMount = false, rerenderOnChange = false, rerenderOnValidation = true, rerenderOnSubmit = true, disableRerenders = [], resetOnUnmount = true }) => {
    var _a, _b, _c, _d, _e, _f;
    const setValues = (value) => setForms(value, formName, 'values');
    const handleErrors = (value) => setForms(value, formName, 'errors');
    const handleValids = (value) => setForms(value, formName, 'valids');
    const [_, triggerRender] = (0, react_1.useState)(0);
    const rerender = () => triggerRender(Math.random());
    const validation = Object.assign(Object.assign({}, (0, validation_1.default)((_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values)), customValidation);
    const validate = (fieldName, value, silent = false) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (fieldName === 'password' && ((_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.valids.confirmPassword)) {
            handleValids(Object.assign(Object.assign({}, (_b = forms[formName]) === null || _b === void 0 ? void 0 : _b.valids), { confirmPassword: null }));
        }
        if (requireds.includes(fieldName) &&
            ((typeof value === 'object' && (0, lodash_isempty_1.default)(value)) || !value)) {
            if (!silent) {
                handleErrors(Object.assign(Object.assign({}, (_c = forms[formName]) === null || _c === void 0 ? void 0 : _c.errors), { [fieldName]: 'This field is mandatory.' }));
                handleValids(Object.assign(Object.assign({}, (_d = forms[formName]) === null || _d === void 0 ? void 0 : _d.valids), { [fieldName]: false }));
            }
            return false;
        }
        else if (validation[fieldName] && !bypassValidation.includes(fieldName)) {
            if (validation[fieldName].test(value)) {
                const _j = (_e = forms[formName]) === null || _e === void 0 ? void 0 : _e.errors, _k = fieldName, deleted = _j[_k], errs = __rest(_j, [typeof _k === "symbol" ? _k : _k + ""]);
                if (!silent) {
                    handleErrors(Object.assign({}, errs));
                    handleValids(Object.assign(Object.assign({}, (_f = forms[formName]) === null || _f === void 0 ? void 0 : _f.valids), { [fieldName]: true }));
                }
                return true;
            }
            else {
                if (!silent) {
                    handleErrors(Object.assign(Object.assign({}, (_g = forms[formName]) === null || _g === void 0 ? void 0 : _g.errors), { [fieldName]: validation[fieldName].error || 'Invalid value' }));
                    handleValids(Object.assign(Object.assign({}, (_h = forms[formName]) === null || _h === void 0 ? void 0 : _h.valids), { [fieldName]: false }));
                }
                return false;
            }
        }
        else
            return true;
    };
    const validateAll = (fieldNames) => {
        var _a, _b, _c, _d;
        const fieldsToValidate = fieldNames.length === 0
            ? Object.keys((_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values)
            : fieldNames;
        let errs = {};
        Object.keys(customValidation).forEach(fieldName => {
            var _a, _b;
            if (!validate(fieldName, (_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values[fieldName], false) &&
                fieldsToValidate.includes(fieldName)) {
                errs[fieldName] = ((_b = validation[fieldName]) === null || _b === void 0 ? void 0 : _b.error) || 'Invalid value.';
            }
        });
        Object.entries((_b = forms[formName]) === null || _b === void 0 ? void 0 : _b.values).forEach(([name, value]) => {
            var _a;
            if (!validate(name, value, false) && fieldsToValidate.includes(name)) {
                errs[name] = ((_a = validation[name]) === null || _a === void 0 ? void 0 : _a.error) || 'Invalid value.';
            }
        });
        requireds.forEach(name => {
            var _a;
            if (!((_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values[name]))
                errs[name] = 'This field is mandatory.';
        });
        handleErrors(Object.assign(Object.assign({}, (_c = forms[formName]) === null || _c === void 0 ? void 0 : _c.errors), errs));
        if ((0, lodash_isempty_1.default)(errs) && (0, lodash_isempty_1.default)((_d = forms[formName]) === null || _d === void 0 ? void 0 : _d.errors)) {
            return true;
        }
        else
            return false;
    };
    const handleSubmit = (event) => {
        var _a;
        if (event)
            event.preventDefault();
        if (validateAll(validateOnSubmit)) {
            onSubmit((_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values);
        }
        rerenderOnSubmit && rerender();
    };
    const validateFieldOnChange = (fieldName, value) => {
        if (validateOnChange.includes(fieldName)) {
            validate(fieldName, value, false);
            rerenderOnValidation &&
                !disableRerenders.includes(fieldName) &&
                rerender();
        }
    };
    const handleChange = (event) => {
        var _a;
        const target = event.target;
        if (event.persist)
            event.persist();
        setValues(Object.assign(Object.assign({}, (_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values), { [target.name]: target.value }));
        validateFieldOnChange(target.name, target.value);
        rerenderOnChange && !disableRerenders.includes(target.name) && rerender();
    };
    const handleChangeCheckbox = (event) => {
        var _a;
        const target = event.target;
        if (event.persist)
            event.persist();
        setValues(Object.assign(Object.assign({}, (_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values), { [target.name]: target.checked }));
        validateFieldOnChange(target.name, target.checked);
        rerenderOnChange && !disableRerenders.includes(target.name) && rerender();
    };
    const handleChangeRadio = (fieldName, fieldValue) => {
        var _a, _b;
        if (((_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values[fieldName]) !== fieldValue) {
            setValues(Object.assign(Object.assign({}, (_b = forms[formName]) === null || _b === void 0 ? void 0 : _b.values), { [fieldName]: fieldValue }));
        }
        validateFieldOnChange(fieldName, fieldValue);
        rerenderOnChange && !disableRerenders.includes(fieldName) && rerender();
    };
    const handleBlur = (e) => {
        var _a, _b, _c;
        const target = e.target;
        setValues(Object.assign(Object.assign({}, (_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values), { [target.name]: target.value }));
        const _d = (_b = forms[formName]) === null || _b === void 0 ? void 0 : _b.errors, _e = target.name, deleted = _d[_e], errs = __rest(_d, [typeof _e === "symbol" ? _e : _e + ""]);
        if (validateOnBlur.includes(target.name) || validateOnBlur.length === 0) {
            validate(target.name, (_c = forms[formName]) === null || _c === void 0 ? void 0 : _c.values[target.name], false);
        }
        rerenderOnValidation &&
            !disableRerenders.includes(target.name) &&
            rerender();
    };
    const handleFileUpload = (event) => {
        var _a;
        const target = event.target;
        const { files } = target;
        const newFormState = Object.assign({}, (_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values);
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
                    setValues(newFormState);
                    return null;
                })();
                reader.readAsDataURL(files[i]);
            }
            validateFieldOnChange(target.name, newFormState[target.name]);
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
    }, [disableKeyListener, (_b = forms[formName]) === null || _b === void 0 ? void 0 : _b.values]);
    (0, react_1.useEffect)(() => {
        var _a;
        if ((0, lodash_isempty_1.default)((_a = forms[formName]) === null || _a === void 0 ? void 0 : _a.values) && !(0, lodash_isempty_1.default)(defaultValues)) {
            setValues(defaultValues);
            if (validateDefaultValuesOnMount) {
                Object.entries(defaultValues).forEach(([name, value]) => {
                    validate(name, value, false);
                });
            }
            rerender();
        }
    }, [(_c = forms[formName]) === null || _c === void 0 ? void 0 : _c.values, validateDefaultValuesOnMount, defaultValues]);
    (0, react_1.useEffect)(() => {
        if (!forms[formName]) {
            setValues({});
            handleValids({});
            handleErrors({});
            rerender();
        }
    }, [forms[formName]]);
    (0, react_1.useEffect)(() => () => {
        if (resetOnUnmount) {
            setValues({});
            handleValids({});
            handleErrors({});
        }
    }, []);
    return {
        errors: ((_d = forms[formName]) === null || _d === void 0 ? void 0 : _d.errors) || {},
        valids: ((_e = forms[formName]) === null || _e === void 0 ? void 0 : _e.valids) || {},
        values: ((_f = forms[formName]) === null || _f === void 0 ? void 0 : _f.values) || {},
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
        handleSubmit,
        rerender
    };
};
exports.default = useForm;
