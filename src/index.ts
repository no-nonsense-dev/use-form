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
  rerenderOnChange = false,
  rerenderOnValidation = true,
  rerenderOnSubmit = true,
  disableRerenders = [],
  resetOnUnmount = true
}: options) => {
  const setValues = (value: any) => setForms(value, formName, 'values')
  const handleErrors = (value: any) => setForms(value, formName, 'errors')
  const handleValids = (value: any) => setForms(value, formName, 'valids')
  const [_, triggerRender] = useState(0)
  const rerender = () => triggerRender(Math.random())

  const validation = {
    ...standardValidation(forms[formName]?.values),
    ...customValidation
  }

  const validate = (fieldName: string, value: any, silent: boolean = false) => {
    if (fieldName === 'password' && forms[formName]?.valids.confirmPassword) {
      handleValids({
        ...forms[formName]?.valids,
        confirmPassword: null
      })
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
        const { [fieldName]: deleted, ...errs } = forms[formName]?.errors
        if (!silent) {
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

  const handleChangeRadio = (fieldName: string, fieldValue: any) => {
    if (forms[formName]?.values[fieldName] !== fieldValue) {
      setValues({ ...forms[formName]?.values, [fieldName]: fieldValue })
    }
    validateFieldOnChange(fieldName, fieldValue)
    rerenderOnChange && !disableRerenders.includes(fieldName) && rerender()
  }

  const handleBlur = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    setValues({ ...forms[formName]?.values, [target.name]: target.value })
    const { [target.name]: deleted, ...errs }: any = forms[formName]?.errors
    if (validateOnBlur.includes(target.name) || validateOnBlur.length === 0) {
      validate(target.name, forms[formName]?.values[target.name], false)
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

  useEffect(() => {
    if (!forms[formName]) {
      setValues({})
      handleValids({})
      handleErrors({})
      rerender()
    }
  }, [forms[formName]])

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
    handleChangeRadio,
    handleFileUpload,
    handleSubmit,
    rerender
  }
}

export default useForm
export { standardValidation, forms, setForms }
