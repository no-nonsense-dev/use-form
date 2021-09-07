import { useState, useEffect, SyntheticEvent } from 'react'
import isEmpty from 'lodash/isEmpty'
import standardValidation from './validation'

interface options {
  defaultValues?: object
  onSubmit?: Function
  requireds?: Array<string>
  bypassValidation?: Array<string>
  onKeyDown?: Function | null
  disableKeyListener?: boolean
  customValidation?: Function
}

const useForm = ({
  defaultValues = {},
  onSubmit = () => {},
  requireds = [],
  bypassValidation = [],
  onKeyDown = null,
  disableKeyListener = false,
  customValidation = () => {}
}: options) => {
  const [errors, handleErrors]: Array<any> = useState({})
  const [valids, handleValids]: Array<any> = useState({})
  const [values, setValues]: Array<any> = useState(defaultValues || {})

  const validation = {
    ...standardValidation(values),
    ...customValidation(values)
  }

  const validate = (fieldName: string, value: any) => {
    if (validation[fieldName]) {
      if (validation[fieldName].test(value)) {
        const { [fieldName]: value, ...errs } = errors
        handleErrors({ ...errs })
        handleValids({ ...valids, [fieldName]: true })
      } else {
        handleErrors({
          ...errors,
          [fieldName]: validation[fieldName].error
        })
        handleValids({ ...valids, [fieldName]: false })
      }
    }
  }

  const handleSubmit = (event: SyntheticEvent | null) => {
    if (event) event.preventDefault()
    const errs: any = {}
    requireds.forEach((name: string) => {
      if (!values[name]) errs[name] = 'This field is mandatory.'
    })
    Object.keys(validation).forEach(name => {
      if (values[name]) validate(name, values[name])
    })

    handleErrors({ ...errors, ...errs })
    if (isEmpty(errors) && isEmpty(errs)) {
      onSubmit(values)
    }
  }

  const handleChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement
    if (event.persist) event.persist()
    setValues({ ...values, [target.name]: target.value })
    const { [target.name]: deleted, ...errs }: any = errors
    handleErrors({ ...errs })
    handleValids(
      values.confirmPassword
        ? { ...valids, [target.name]: null, confirmPassword: null }
        : { ...valids, [target.name]: null }
    )
  }

  const handleChangeCheckbox = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement
    if (event.persist) event.persist()
    setValues((values: object) => ({
      ...values,
      [target.name]: target.checked
    }))
  }

  const handleChangeRadio = (fieldName: string, fieldValue: any) => {
    if (values[fieldName] !== fieldValue) {
      setValues((values: object) => ({ ...values, [fieldName]: fieldValue }))
    }
  }

  const handleBlur = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    const { [target.name]: deleted, ...errs }: any = errors
    if (requireds.includes(target.name) && !values[target.name]) {
      handleErrors({ ...errs, [target.name]: 'This field is mandatory.' })
    } else if (
      !bypassValidation.includes(target.name) &&
      validation[target.name]
    ) {
      validate(target.name, values[target.name])
    } else {
      handleErrors(errs)
      handleValids({ ...valids, [target.name]: true })
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
    }
  }

  const handleKeyDown = (event: KeyboardEvent) =>
    onKeyDown
      ? onKeyDown(event, values)
      : event.key === 'Enter'
      ? handleSubmit(null)
      : null

  useEffect(() => {
    if (!disableKeyListener) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disableKeyListener, values])

  return {
    errors,
    valids,
    values,
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
