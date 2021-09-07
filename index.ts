import { useState, useEffect, SyntheticEvent } from 'react'
import isEmpty from 'lodash/isEmpty'

interface options {
  defaultValues?: any
  onSubmit: Function
  requireds?: Array<string>
  requiresValidation?: Array<string>
  disableKeyListener: boolean
}

const useForm = ({
  defaultValues = {},
  onSubmit = (values: any) => {},
  requireds = [''],
  requiresValidation = [''],
  disableKeyListener = false
}: options) => {
  const [errors, handleErrors]: Array<any> = useState({})
  const [valids, handleValids]:Array<any> = useState({})
  const [values, setValues]: Array<any> = useState(defaultValues || {})

  const handleSubmit = (event: SyntheticEvent|null) => {
    if (event) event.preventDefault()
    const errs: any = {}
    requireds.forEach((name: string) => {
      if (!values[name]) errs[name] = 'This field is mandatory.'
    })
    requiresValidation.forEach(name => standardValidation[name](values[name]))

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
    setValues((values: any) => ({
      ...values,
      [target.name]: target.checked
    }))
  }

  const handleChangeRadio = (fieldName: string, fieldValue: any) => {
    if (values[fieldName] !== fieldValue) {
      setValues((values: any) => ({ ...values, [fieldName]: fieldValue }))
    }
  }

  const handleBlur = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    const { [target.name]: deleted, ...errs }: any = errors
    if (requireds.includes(target.name) && !target.value) {
      handleErrors({ ...errs, [target.name]: 'This field is mandatory.' })
    } else if (
      requiresValidation.includes(target.name) &&
      standardValidation[target.name]
    ) {
      standardValidation[target.name](target.value)
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

  const validated = (fieldName:string) => {
    const { [fieldName]: value, ...errs } = errors
    handleErrors({ ...errs })
    handleValids({ ...valids, [fieldName]: true })
  }

  const denied = (fieldName:string, message:string) => {
    handleErrors({
      ...errors,
      [fieldName]: message
    })
    handleValids({ ...valids, [fieldName]: false })
  }
  const standardValidation: any = {
    phone: (value: string) => {
      if (
        /^(?:00|\+)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/.test(
          value
        )
      ) {
        return validated('phone')
      }
      return denied(
        'phone',
        'Please use international format ("+XX" or "00XX" without spaces).'
      )
    },
    email: (value:string) => {
      if (
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
          value?.toLowerCase()
        )
      ) {
        return validated('email')
      }
      return denied('email', 'This does not look like a valid email address.')
    },
    password: (value:string) => {
      if (/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{7,})\S$/.test(value)) {
        return validated('password')
      } else {
        return denied(
          'password',
          'Passwords must contain at least 8 characters, 1 uppercase, 1 lowercase & 1 number.'
        )
      }
    },
    confirmPassword: (value:string) => {
      if (values.password === value) {
        return validated('confirmPassword')
      }
      return denied('confirmPassword', 'Passwords do not match.')
    }
  }

  const handleKeyDown = (event:KeyboardEvent) => {
    if (event.key === 'Enter') handleSubmit(null)
  }

  useEffect(() => {
    if (!disableKeyListener) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disableKeyListener])

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
  }
}

export default useForm
