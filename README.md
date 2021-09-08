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
- `customValidation`- Object of names and their corresponding validation test and optional error message if the test fails. These rules can override the default validation rules. See below for examples.
- `bypassValidation` - Array of field names that will not be tested against any validation rules.
- `onKeyDown` - Function that will be passed to the key event listener. If left undefined, handleSubmit will be triggered when pressing Enter.
- `disableKeyListener` - Boolean to disable the key listener. If true, will also disable the function passed to onKeyDown.

### Returned values

The hook returns an object of properties to be used in the component:

- `values` - Object of field names and their corresponding values.
- `errors` - Object of field names and their corresponding error message. If no error property is present for a given field, this field should be considered valid.
- `valids` - Object of field names and a boolean stating if this field is valid or not.
- `validate` - Function that will validate fields against validation rules. Will trigger handleValids & handleErrors to add/remove validity & error messages, and return a boolean stating if field is valid or not.
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
  customValidation: {
    firstName: {
      test: value => value.length > 1,
      error: 'First name must be at least 2 characters long'
    }
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

#### Enforcing rules depending on other form values

You can pass `values` as argument to options, so form values can be used in the tests:

```js
const options = (values) => {
  customValidation: {
    firstName: {
      test: value => value !== values.lastName,
      error: 'First name must not be the same as last name'
    }
  }
}

// ...inside the component:
{ values } = useForm(options(values))
//

```

or even declare options right within your component:

```js
{ values } = useForm({
  customValidation: {
    firstName: {
      // Will work too!
      test: value => value !== values.lastName,
      error: 'First name must not be the same as last name'
    }
  }
})

```

#### Enforcing multiple rules in the same field

You can pass handleErrors to options so it can be used directly inside the test function. In this case, the error message will be added to the `errors` object.

```js
const options = (values, handleErrors) => {
  customValidation: {
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
    }
  }
}
```

#### Overriding standard validation:

In customValidation, you can pass a field name used in standardValidation to override its test rules. Let's try with `email`:

```js
const options = {
  customValidation: {
    email: {
      test: value => value.includes('@'),
      error: 'Email must be valid'
    }
  }
}
```

### Key listeners

onKeyDown can be used to trigger a function when a key is pressed, or override the default behavior of handleSubmit when pressing Enter:

```js
const options = {
  onKeyDown: (e) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed!')
    }
  }
```
