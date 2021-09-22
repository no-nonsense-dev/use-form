import { useState, useEffect, SyntheticEvent } from 'react'
import isEmpty from 'lodash.isempty'
import standardValidation from './validation'

interface options {
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
}

let values: any = {}
const setValues: Function = (newVal: object) => (values = newVal)

const useForm = ({
  defaultValues = {},
  onSubmit = () => {},
  requireds = [],
  bypassValidation = [],
  onKeyDown = null,
  disableKeyListener = false,
  customValidation = {},
  validateOnChange = [],
  validateOnBlur = [],
  validateOnSubmit = [],
  validateDefaultValuesOnMount = false
}: options) => {
  const [errors, handleErrors]: Array<any> = useState({})
  const [valids, handleValids]: Array<any> = useState({})

  const validation = {
    ...standardValidation(values),
    ...customValidation
  }

  const validate = (fieldName: string, value: any, silent: boolean = false) => {
    if (
      requireds.includes(fieldName) &&
      ((typeof value === 'object' && isEmpty(value)) || !value)
    ) {
      !silent &&
        handleErrors({ ...errors, [fieldName]: 'This field is mandatory.' })
      !silent && handleValids({ ...valids, [fieldName]: false })
      return false
    } else if (validation[fieldName] && !bypassValidation.includes(fieldName)) {
      if (validation[fieldName].test(value)) {
        const { [fieldName]: value, ...errs } = errors
        !silent && handleErrors({ ...errs })
        !silent && handleValids({ ...valids, [fieldName]: true })
        return true
      } else {
        if (validation[fieldName].error && !silent) {
          handleErrors({
            ...errors,
            [fieldName]: validation[fieldName].error
          })
        }
        !silent && handleValids({ ...valids, [fieldName]: false })
        return false
      }
    } else return true
  }

  const validateAll = (bypassedFieldNames: Array<string>) => {
    let errs: any = {}

    Object.keys(customValidation).forEach(fieldName => {
      if (
        !validate(fieldName, values[fieldName]) &&
        !bypassedFieldNames.includes(fieldName)
      ) {
        errs[fieldName] = validation[fieldName]?.error || 'Invalid value.'
      }
    })
    Object.entries(values).forEach(([name, value]) => {
      if (!validate(name, value) && !bypassedFieldNames.includes(name)) {
        errs[name] = validation[name]?.error || 'Invalid value.'
      }
    })

    requireds.forEach(name => {
      if (!values[name]) errs[name] = 'This field is mandatory.'
    })

    handleErrors({ ...errors, ...errs })

    if (isEmpty(errs) && isEmpty(errors)) {
      return true
    } else return false
  }

  const handleSubmit = (event: SyntheticEvent | null) => {
    if (event) event.preventDefault()
    if (validateAll(validateOnSubmit)) {
      onSubmit(values)
    }
  }

  const cleanFieldError = (fieldName: string) => {
    const { [fieldName]: deleted, ...errs } = errors
    handleErrors({ ...errs })
  }

  const validateFieldOnChange = (fieldName: string, value: any) => {
    if (validateOnChange.includes(fieldName)) {
      validate(fieldName, value)
    } else cleanFieldError(fieldName)
  }

  const handleChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement
    if (event.persist) event.persist()
    setValues({ ...values, [target.name]: target.value })
    validateFieldOnChange(target.name, target.value)
    if (!validateOnChange.includes(target.name)) {
      handleValids(
        values.confirmPassword
          ? { ...valids, [target.name]: null, confirmPassword: null }
          : { ...valids, [target.name]: null }
      )
    }
  }

  const handleChangeCheckbox = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement
    if (event.persist) event.persist()
    setValues({
      ...values,
      [target.name]: target.checked
    })
    validateFieldOnChange(target.name, target.checked)
  }

  const handleChangeRadio = (fieldName: string, fieldValue: any) => {
    if (values[fieldName] !== fieldValue) {
      setValues({ ...values, [fieldName]: fieldValue })
    }
    validateFieldOnChange(fieldName, fieldValue)
  }

  const handleBlur = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    const { [target.name]: deleted, ...errs }: any = errors
    if (validateOnBlur.includes(target.name) || validateOnBlur.length === 0) {
      validate(target.name, values[target.name])
    }
  }

  const handleFileUpload = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement
    const { files } = target
    const newFormState = { ...values }

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
          return setValues(newFormState)
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
  }, [disableKeyListener, values])

  useEffect(() => {
    if (isEmpty(values) && !isEmpty(defaultValues)) {
      setValues(defaultValues)
      if (validateDefaultValuesOnMount) {
        Object.entries(defaultValues).forEach(([name, value]) => {
          validate(name, value)
        })
      } else handleErrors({})
    }
  }, [values, defaultValues])

  useEffect(() => () => setValues({}), [])

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
  }
}

export default useForm
