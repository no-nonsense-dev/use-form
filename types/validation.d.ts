declare const standardValidation: (formName: string) => {
    phone: {
        test: (value: string) => boolean;
        error: string;
    };
    email: {
        test: (value: string) => boolean;
        error: string;
    };
    password: {
        test: (value: string) => boolean;
        error: string;
    };
    confirmPassword: {
        test: (value: string) => boolean;
        error: string;
    };
};
export default standardValidation;
//# sourceMappingURL=validation.d.ts.map