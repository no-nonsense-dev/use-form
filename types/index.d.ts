import { SyntheticEvent, Dispatch, SetStateAction } from 'react';
import standardValidation from './validation';
export interface FormOptions {
    formName: string;
    defaultValues: object;
    onSubmit: Function;
    requireds: Array<string>;
    bypassValidation: Array<string>;
    onKeyDown: Function | null;
    disableKeyListener: boolean;
    customValidation: any;
    validateOnChange: Array<string>;
    validateOnBlur: Array<string>;
    validateOnSubmit: Array<string>;
    validateDefaultValuesOnMount: boolean;
    rerenderOnValidation: boolean;
    rerenderOnChange: boolean;
    rerenderOnSubmit: boolean;
    disableRerenders: Array<string>;
    resetOnUnmount: boolean;
}
export interface Form {
    values: any;
    errors: any;
    valids: any;
    validate: (fieldName: string, value: any, silent: boolean) => boolean;
    validateAll: (fieldNames: Array<string>) => boolean;
    validation: any;
    setValues: Dispatch<SetStateAction<any>>;
    handleErrors: Dispatch<SetStateAction<any>>;
    handleValids: Dispatch<SetStateAction<any>>;
    handleChange: (event: SyntheticEvent) => void;
    handleBlur: (event: SyntheticEvent) => void;
    handleChangeCheckbox: (event: SyntheticEvent) => void;
    handleFileUpload: (event: SyntheticEvent) => void;
    handleSubmit: (event: SyntheticEvent) => void;
    rerender: Function;
}
declare let forms: any;
declare const setForms: Function;
declare const useForm: ({ defaultValues, formName, onSubmit, requireds, bypassValidation, onKeyDown, disableKeyListener, customValidation, validateOnChange, validateOnBlur, validateOnSubmit, validateDefaultValuesOnMount, rerenderOnChange, rerenderOnValidation, rerenderOnSubmit, disableRerenders, resetOnUnmount }: FormOptions) => Form;
export default useForm;
export { standardValidation, forms, setForms, };
//# sourceMappingURL=index.d.ts.map