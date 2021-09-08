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
import useForm from '@nononsense/use-form'

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
      placeholder={'John'}
      onChange={handleChange}
      onBlur={handleBlur}
    />
    <input
      type='email'
      value={values.firstName || ''}
      name={'email'}
      placeholder={'john.doe@acme.com'}
      onChange={handleChange}
      onBlur={handleBlur}
    />
    <button onClick={handleSubmit}>Submit</button>
  )
}
```

## Options

The useForm hook accepts a number of options to customize its behavior:

- `onSubmit` - Callback function to be called when form is submitted.
- `defaultValues` - Object of field names and their corresponding default values.
- `requireds` - Array of field names that are required.
- `customValidation`- Function that takes the form values as argument and returns an object of names and their corresponding validation test and optional error message if the test fails. These rules can override the default validation rules. See below for examples.
- `bypassValidation` - Array of field names that will not be tested against any validation rules.
- `onKeyDown` - Function that will be passed to the key event listener. If left undefined, handleSubmit will be triggered when pressing Enter.
- `disableKeyListener` - Boolean to disable the key listener. If true, will also disable the function passed to onKeyDown.

## Advanced Usage

## Standard validation

Some fields are natively validated against standard validation rules. The fields with the following `name` will be validated:

- `phone`
- `email`
- `password`
- `confirmPassword`

These rules can be found in /src/validation.js, and can be overriden with `customValidation` (see below).

### Custom Validation

Simple validation field:

```js
const options = {
  onSubmit: data => console.log('submitted:', data),
  requireds: ['firstName', 'email'],

  // Custom validation:
  customValidation: () => ({
    firstName: {
      test: value => value.length > 1,
      error: 'First name must be at least 2 characters long'
    }
  //

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
      placeholder={'John'}
      onChange={handleChange}

      // Make sure to give the same name as in customValidation:
      name={'firstName'}
      //

      // Validation will be triggered on blur:
      onBlur={handleBlur}
      //

      // Input style can be modified according to validation:
      style={{
        color: errors.firstName
          ? 'red'
          : valids.firstName
            ? 'green'
            : 'black'
      }}
      //
    />

    // Errors can be displayed via the errors object:
    {errors.firstName && <div style={{ color: red }}>{errors.firstName}</div>}
    //

    // handleSubmit will check all fields for validation, and won't trigger onSubmit if errors are detected.
    <button onClick={handleSubmit}>Submit</button>
    //
  )
}

```

Enforcing rules depending on other form values:

```js
const options = {
  customValidation: (values) => ({
    firstName: {
      test: value => value !== values.lastName,
      error: 'First name must not be the same as last name'
    }
}
```

Enforcing multiple rules in the same field:

```js
const options = {
  // handleErrors is passed to customValidation, and can be used inside the test function instead of a separate error message:
  customValidation: (values, handleErrors) => ({
    firstName: {
      test: value => {
        if (value === values.lastName) {
          handleErrors({ firstName: 'First name must not be the same as last name' })
          // Don't forget to return false if test does not pass:
          return false
          //
        } else if(value.length < 2) {
          handleErrors({ firstName: 'First name must be at least 2 characters long' })
          return false
        } else return true
      },
      // No error field is provided
    }
}
```

Overriding standard validation:

```js
const options = {
  // Simply pass a field name used in standardValidation to override its test rules:
  customValidation: (values, handleErrors) => ({
    email: {
      test: value => value.includes('@'),
      error: 'Email must be valid'
    }
}
```

### Key listeners

onKeyDown can be used to trigger a function when a key is pressed, or override the default behavior (handleSubmit when pressing Enter):

```js
const options = {
  onKeyDown: (e, values) => {
    if (e.key === 'Enter' && values.firstName) {
      console.log(values)
    }
  }
```
