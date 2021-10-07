import { useState, useEffect, SyntheticEvent } from 'react'
import isEmpty from 'lodash.isempty'
import standardValidation from './validation'

interface options {
  formName: string
  defaultValues: object
  onSubmit: Function
  requireds: Array<string>
  bypassValidation: Array<string>
  onKeyDown: Function | null
  disableKeyListener: boolean
  customValidation: any
  validateOnChange: Array<string>
  validateOnBlur: Array<string>
  validateOnSubmit: Array<string>
  validateDefaultValuesOnMount: boolean
  rerenderOnValidation: boolean
  rerenderOnChange: boolean
  rerenderOnSubmit: boolean
  disableRerenders: Array<string>
  resetOnUnmount: boolean
}

let forms: any = {}
const setForm: Function = (newVal: object, formName: string, prop: string) =>
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
  rerenderOnChange = false,
  rerenderOnValidation = true,
  rerenderOnSubmit = false,
  disableRerenders = [],
  resetOnUnmount = true
}: options) => {
  const setValues = (value: any) => setForm(value, formName, 'values')
  const handleErrors = (value: any) => setForm(value, formName, 'errors')
  const handleValids = (value: any) => setForm(value, formName, 'valids')
  const [_, triggerRender] = useState(0)
  const rerender = () => triggerRender(Math.random())

  const validation = {
    ...standardValidation(forms[formName]?.values),
    ...customValidation
  }

  const validate = (fieldName: string, value: any, silent: boolean = false) => {
    if (
      requireds.includes(fieldName) &&
      ((typeof value === 'object' && isEmpty(value)) || !value)
    ) {
      !silent &&
        handleErrors({
          ...forms[formName]?.errors,
          [fieldName]: 'This field is mandatory.'
        })
      !silent &&
        handleValids({ ...forms[formName]?.valids, [fieldName]: false })
      rerenderOnValidation &&
        !disableRerenders.includes(fieldName) &&
        rerender()
      return false
    } else if (validation[fieldName] && !bypassValidation.includes(fieldName)) {
      if (validation[fieldName].test(value)) {
        const { [fieldName]: value, ...errs } = forms[formName]?.errors
        !silent && handleErrors({ ...errs })
        !silent &&
          handleValids({ ...forms[formName]?.valids, [fieldName]: true })
        rerenderOnValidation &&
          !disableRerenders.includes(fieldName) &&
          rerender()
        return true
      } else {
        if (validation[fieldName].error && !silent) {
          handleErrors({
            ...forms[formName]?.errors,
            [fieldName]: validation[fieldName].error || 'Invalid value'
          })
        }
        !silent &&
          handleValids({ ...forms[formName]?.valids, [fieldName]: false })
        rerenderOnValidation &&
          !disableRerenders.includes(fieldName) &&
          rerender()
        return false
      }
    } else return true
  }

  const validateAll = (fieldNames: Array<string>) => {
    const fieldsToValidate =
      fieldNames.length === 0
        ? Object.keys(forms[formName]?.values)
        : fieldNames
    let errs: any = {}

    Object.keys(customValidation).forEach(fieldName => {
      if (
        !validate(fieldName, forms[formName]?.values[fieldName]) &&
        fieldsToValidate.includes(fieldName)
      ) {
        errs[fieldName] = validation[fieldName]?.error || 'Invalid value.'
      }
    })
    Object.entries(forms[formName]?.values).forEach(([name, value]) => {
      if (!validate(name, value) && fieldsToValidate.includes(name)) {
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
      !rerenderOnValidation && rerenderOnSubmit && rerender()
    }
  }

  const validateFieldOnChange = (fieldName: string, value: any) => {
    if (validateOnChange.includes(fieldName)) {
      if (fieldName === 'password') {
        handleValids(
          forms[formName]?.values.confirmPassword
            ? {
                ...forms[formName]?.valids,
                [fieldName]: null,
                confirmPassword: null
              }
            : { ...forms[formName]?.valids, [fieldName]: null }
        )
      }
      validate(fieldName, value)
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
  }

  const handleChangeRadio = (fieldName: string, fieldValue: any) => {
    if (forms[formName]?.values[fieldName] !== fieldValue) {
      setValues({ ...forms[formName]?.values, [fieldName]: fieldValue })
    }
    validateFieldOnChange(fieldName, fieldValue)
  }

  const handleBlur = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    setValues({ ...forms[formName]?.values, [target.name]: target.value })
    const { [target.name]: deleted, ...errs }: any = forms[formName]?.errors
    if (validateOnBlur.includes(target.name) || validateOnBlur.length === 0) {
      validate(target.name, forms[formName]?.values[target.name])
    }
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
          validate(name, value)
        })
      }
      rerender()
    }
  }, [forms[formName]?.values, validateDefaultValuesOnMount, defaultValues])

  useEffect(() => {
    if (!forms[formName]) {
      setValues({})
      handleValids({})
      handleErrors({})
      rerender()
    }
    return () => {
      if (resetOnUnmount) {
        setValues({})
        handleValids({})
        handleErrors({})
      }
    }
  }, [forms[formName]])

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
    handleChangeRadio,
    handleFileUpload,
    handleSubmit
  }
}

export default useForm
export { standardValidation }
