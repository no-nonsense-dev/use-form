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

const MyComponent = () => {
  const {
    values,
    errors,
    valids,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm({
    onSubmit,
    requireds: ['firstName', 'email']
  })

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

  * `onSubmit` - Callback function to be called when form is submitted
  * `requireds` - Array of field names that are required
  * `requiresValidation` - Array of field names that will be validated
  * `defaultValues` - Object of field names and their corresponding default values
  * `disableKeyListener` - Boolean to disable key listener (will not trigger handleSubmit on pressing Enter)

## Advanced Usage


