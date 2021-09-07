# use-form

Lightweight, un-opinionated, no-nonsense React hook for form validation

## Installation

Using npm:

```console
npm install --save @nononsense/use-form
```

Using yarn:

```console
yarn add @nononsense/use-form
```

## Basic Usage

```js
import React from 'react'
import useForm from 'use-form'

const onSubmit = data => console.log(data)

const options = {
  onSubmit,
  requireds: ['firstName', 'email']
}

const MyComponent = () => {
  const {
    values,
    errors,
    valids,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(options)

  return (
    <input
      type='text'
      value={values.firstName || ''}
      name={'firstName'}
      error={errors.firstName || false}
      valid={valids.firstName || false}
      placeholder={'John'}
      onChange={handleChange}
      onBlur={handleBlur}
    />
    <input
      type='email'
      value={values.firstName || ''}
      name={'email'}
      error={errors.firstName || false}
      valid={valids.firstName || false}
      placeholder={'john.doe@acme.com'}
      onChange={handleChange}
      onBlur={handleBlur}
    />
    <button onClick={handleSubmit}>
  )
}
```

## Options

The useForm hook accepts a number of options to customize its behavior:

- `onSubmit` - Callback function to be called when form is submitted
- `defaultValues` - Object of field names and their corresponding default values
- `requireds` - Array of field names that are required
- `requiresValidation` - Array of field names that will be tested against standard and custom validation rules
- `customValidation`- Function that takes the form values as argument and returns an object of names and their corresponding validation test, and error message if it does not pass. It can override the default validation rules. See below for examples.
- `onKeyDown` - Function that will be passed to the key event listener. If left undefined, handleSubmit will be triggered when pressing Enter.
- `disableKeyListener` - Boolean to disable the key listener. If true, will also disable the function passed to onKeyDown.

## Advanced Usage
