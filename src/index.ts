import { useState, useEffect, SyntheticEvent, Dispatch, SetStateAction } from 'react'
import isEmpty from 'lodash.isempty'
import standardValidation from './validation'

export interface FormOptions {
  formName?: string
  defaultValues?: object
  onSubmit?: Function
  requireds?: Array<string>
  bypassValidation?: Array<string>
  onKeyDown?: Function | null
  disableKeyListener?: boolean
  customValidation?: any
  validateOnChange?: Array<string>
  validateOnBlur?: Array<string>
  validateOnSubmit?: Array<string>
  validateDefaultValuesOnMount?: boolean
  rerenderOnValidation?: boolean
  rerenderOnChange?: boolean
  rerenderOnSubmit?: boolean
  disableRerenders?: Array<string>
  resetOnUnmount?: boolean
}

export interface Form {
  values: any
  errors: any
  valids: any
  validate: (fieldName: string, value: any, silent: boolean) => boolean
  validateAll: (fieldNames: Array<string>) => boolean
  validation: any
  setValues: Dispatch<SetStateAction<any>>
  handleErrors: Dispatch<SetStateAction<any>>
  handleValids: Dispatch<SetStateAction<any>>
  handleChange: (event: SyntheticEvent) => void
  handleBlur: (event: SyntheticEvent) => void
  handleChangeCheckbox: (event: SyntheticEvent) => void
  handleFileUpload: (event: SyntheticEvent) => void
  handleSubmit: (event: SyntheticEvent) => void
  rerender: Function
}

let forms: any = {}
const setForms: Function = (newVal: object, formName: string, prop: string) =>
  (forms = {
    ...forms,
    [formName]: {
      ...forms[formName],
      [prop]: newVal
    }
  })

const useForm = ({
  defaultValues = {},
  formName = 'UnnamedForm',
  onSubmit = () => {},
  requireds = [],
  bypassValidation = [],
  onKeyDown = null,
  disableKeyListener = false,
  customValidation = {},
  validateOnChange = [],
  validateOnBlur = [],
  validateOnSubmit = [],
  validateDefaultValuesOnMount = false,
  rerenderOnChange = true,
  rerenderOnValidation = true,
  rerenderOnSubmit = true,
  disableRerenders = [],
  resetOnUnmount = true
}: FormOptions) => {
  const setValues = (value: any) => setForms(value, formName, 'values')
  const handleErrors = (value: any) => setForms(value, formName, 'errors')
  const handleValids = (value: any) => setForms(value, formName, 'valids')
  const [_, triggerRender] = useState(0)
  const rerender = () => triggerRender(Math.random())

  useEffect(() => {
    if (!forms[formName]) {
      setValues({})
      handleValids({})
      handleErrors({})
      rerender()
    }
  }, [forms[formName]])

  const validation = {
    ...standardValidation(formName),
    ...customValidation
  }

  const validate = (fieldName: string, value: any, silent: boolean = false) => {
    if (fieldName === 'password' && !silent) {
      validate('confirmPassword', forms[formName]?.values?.confirmPassword, false)
    }
    if (
      requireds.includes(fieldName) &&
      ((typeof value === 'object' && isEmpty(value)) || !value)
    ) {
      if (!silent) {
        handleErrors({
          ...forms[formName]?.errors,
          [fieldName]: 'This field is mandatory.'
        })
        handleValids({ ...forms[formName]?.valids, [fieldName]: false })
      }
      return false
    } else if (validation[fieldName] && !bypassValidation.includes(fieldName)) {
      if (validation[fieldName].test(value)) {
        if (!silent) {
          const { [fieldName]: deleted, ...errs } = forms[formName]?.errors
          handleErrors({ ...errs })
          handleValids({ ...forms[formName]?.valids, [fieldName]: true })
        }
        return true
      } else {
        if (!silent) {
          handleErrors({
            ...forms[formName]?.errors,
            [fieldName]: validation[fieldName].error || 'Invalid value'
          })
          handleValids({ ...forms[formName]?.valids, [fieldName]: false })
        }
        return false
      }
    } else {
      if (!silent) {
        const { [fieldName]: deleted, ...errs } = forms[formName]?.errors
        handleErrors({ ...errs })
        handleValids({ ...forms[formName]?.valids, [fieldName]: true })
      }
      return true
    }
  }

  const validateAll = (fieldNames: Array<string>) => {
    const fieldsToValidate =
      fieldNames.length === 0
        ? Object.keys(forms[formName]?.values)
        : fieldNames
    let errs: any = {}

    Object.keys(customValidation).forEach(fieldName => {
      if (
        !validate(fieldName, forms[formName]?.values[fieldName], false) &&
        fieldsToValidate.includes(fieldName)
      ) {
        errs[fieldName] = validation[fieldName]?.error || 'Invalid value.'
      }
    })
    Object.entries(forms[formName]?.values).forEach(([name, value]) => {
      if (!validate(name, value, false) && fieldsToValidate.includes(name)) {
        errs[name] = validation[name]?.error || 'Invalid value.'
      }
    })

    requireds.forEach(name => {
      if (!forms[formName]?.values[name])
        errs[name] = 'This field is mandatory.'
    })

    handleErrors({ ...forms[formName]?.errors, ...errs })

    if (isEmpty(errs) && isEmpty(forms[formName]?.errors)) {
      return true
    } else return false
  }

  const handleSubmit = (event: SyntheticEvent | null) => {
    if (event) event.preventDefault()
    if (validateAll(validateOnSubmit)) {
      onSubmit(forms[formName]?.values)
    }
    rerenderOnSubmit && rerender()
  }

  const validateFieldOnChange = (fieldName: string, value: any) => {
    if (validateOnChange.includes(fieldName)) {
      validate(fieldName, value, false)
      rerenderOnValidation &&
        !disableRerenders.includes(fieldName) &&
        rerender()
    }
  }

  const handleChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement
    if (event.persist) event.persist()
    setValues({ ...forms[formName]?.values, [target.name]: target.value })
    validateFieldOnChange(target.name, target.value)
    rerenderOnChange && !disableRerenders.includes(target.name) && rerender()
  }

  const handleChangeCheckbox = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement
    if (event.persist) event.persist()
    setValues({
      ...forms[formName]?.values,
      [target.name]: target.checked
    })
    validateFieldOnChange(target.name, target.checked)
    rerenderOnChange && !disableRerenders.includes(target.name) && rerender()
  }

  const handleBlur = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    setValues({ ...forms[formName]?.values, [target.name]: target.value })
    if (validateOnBlur.includes(target.name) || validateOnBlur.length === 0) {
      validate(target.name, target.value, false)
    }
    rerenderOnValidation &&
      !disableRerenders.includes(target.name) &&
      rerender()
  }

  const handleFileUpload = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement
    const { files } = target
    const newFormState = { ...forms[formName]?.values }

    if (!newFormState[target.name]) {
      newFormState[target.name] = []
    }

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader()
        reader.onload = (function () {
          newFormState[target.name] = [
            ...newFormState[target.name],
            reader.result
          ]
          setValues(newFormState)
          return null
        })()
        reader.readAsDataURL(files[i])
      }
      validateFieldOnChange(target.name, newFormState[target.name])
    }
  }

  const handleKeyDown = (event: KeyboardEvent) =>
    onKeyDown
      ? onKeyDown(event)
      : event.key === 'Enter'
      ? handleSubmit(null)
      : null

  useEffect(() => {
    if (!disableKeyListener) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disableKeyListener, forms[formName]?.values])

  useEffect(() => {
    if (isEmpty(forms[formName]?.values) && !isEmpty(defaultValues)) {
      setValues(defaultValues)
      if (validateDefaultValuesOnMount) {
        Object.entries(defaultValues).forEach(([name, value]) => {
          validate(name, value, false)
        })
      }
      rerender()
    }
  }, [forms[formName]?.values, validateDefaultValuesOnMount, defaultValues])

  useEffect(
    () => () => {
      if (resetOnUnmount) {
        setValues({})
        handleValids({})
        handleErrors({})
      }
    },
    []
  )

  return {
    errors: forms[formName]?.errors || {},
    valids: forms[formName]?.valids || {},
    values: forms[formName]?.values || {},
    validate,
    validateAll,
    validation,
    setValues,
    handleErrors,
    handleValids,
    handleChange,
    handleBlur,
    handleChangeCheckbox,
    handleFileUpload,
    handleSubmit,
    rerender
  } as Form
}

export default useForm
export { standardValidation, forms, setForms, }
