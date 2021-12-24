import { SyntheticEvent, Dispatch, SetStateAction } from 'react'

export interface FormOptions {
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
