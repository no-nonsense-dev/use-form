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

## API

### Options

The useForm hook accepts a number of options to customize its behavior:

- `onSubmit` - Callback function to be called when form is submitted.
- `defaultValues` - Object of field names and their corresponding default values.
- `requireds` - Array of field names that are required.
- `customValidation`- Function that takes the form values as argument and returns an object of names and their corresponding validation test and optional error message if the test fails. These rules can override the default validation rules. See below for examples.
- `bypassValidation` - Array of field names that will not be tested against any validation rules.
- `onKeyDown` - Function that will be passed to the key event listener. If left undefined, handleSubmit will be triggered when pressing Enter.
- `disableKeyListener` - Boolean to disable the key listener. If true, will also disable the function passed to onKeyDown.

### Returned values

The hook returns an object of properties to be used in the component:

- `values` - Object of field names and their corresponding values.
- `errors` - Object of field names and their corresponding error message. If no error property is present for a given field, this field should be considered valid.
- `valids` - Object of field names and a boolean stating if this field is valid or not.
- `validation` - Object of field names and the corresponding validation test that will be enforce, including customValidation & standardValidation.
- `handleSubmit` - Function that takes a submit event as argument and calls the onSubmit callback function.
- `handleChange` - Function that takes a change event as argument and updates the `values` object.
- `handleBlur` - Function that takes a blur event as argument and updates the errors and valids objects on input blur.
- `handleChangeCheckbox` - Function that takes a change event from a checkbox input as argument and updates the `values` object.
- `handleChangeRadio` - Function that takes a change event from a radio as argument and updates the `values` object.
- `handleFileUpload` - Function that takes a change event from a file upload as argument and updates the `values` object.
- `handleErrors` - Function to manually change the `errors` object.
- `handleValids` - Function to manually change the `valids` object.
- `setValues` - Function to manually set the `values` object without triggering validation.

## Advanced Usage

### Standard validation

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

    // handleSubmit will check all fields for validation,
    // and won't trigger onSubmit if errors are detected.
    <button onClick={handleSubmit}>Submit</button>
    //
  )
}

```

Enforcing rules depending on other form values:

```js
const options = {
  // Pass `values` as argument to customValidation function,
  // so form values can be used in the tests:
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
  // handleErrors is passed to customValidation, and can be used
  // inside the test function instead of a separate error message:
  customValidation: (values, handleErrors) => ({
    firstName: {
      test: value => {
        if (value === values.lastName) {
          handleErrors({
            firstName: 'First name must not be the same as last name'
          })
          // Don't forget to return false if test does not pass:
          return false
          //
        } else if (value.length < 2) {
          handleErrors({
            firstName: 'First name must be at least 2 characters long'
          })
          return false
        } else return true
      }
      // No error field is provided
    }
  })
}
```

Overriding standard validation:

```js
const options = {
  customValidation: (values, handleErrors) => ({
    // In customValidation, pass a field name used in
    // standardValidation to override its test rules:
    email: {
      test: value => value.includes('@'),
      error: 'Email must be valid'
    }
    //
  })
}
```

### Key listeners

onKeyDown can be used to trigger a function when a key is pressed, or override the default behavior of handleSubmit when pressing Enter:

```js
const options = {
  // Pass a function to onKeyDown:
  onKeyDown: (e, values) => {
    if (e.key === 'Enter' && values.firstName) {
      console.log(values)
    }
  }
  //
```
