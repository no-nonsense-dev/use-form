# use-form

## Simple, lightweight, no-nonsense React hook for form validation.

Why using use-form versus more complex libraries, such as [react-hook-form](https://react-hook-form.com/) or [formik](https://formik.org/)?

- use-form is **simple**: you will get **all** the benefits of production-ready form validation, using code patterns  you already know, without the need to dive into deep documentation.
- use-form is **lightweight**: it is a tiny library (8kB, 3kB gzipped), with only 1 dependency ([lodash.isempty](https://www.npmjs.com/package/lodash.isempty)) and a minimal API that gives you **all** that you need.
- use-form is **fast**: it re-renders your component only when you need to.
- use-form is **un-opinionated**: it integrates seamlessly with robust UI libraries such as [material-ui](https://material-ui.com/) (with their `error`, `valid` or `helperText` props), but also with native HTML input tags.
- use-form is **typechecked**: it reduces errors by always enforcing only the right types.

In one word:
- use-form is **no-nonsense**: it is **safe**, **easy** to use, and **easy** to understand.

## Installation

Using npm:

```console
npm i --save @nononsense/use-form
```

Using yarn:

```console
yarn add @nononsense/use-form
```

## Basic Usage

```js
import React from 'react'
import useForm from '@nononsense/use-form'

const options = {
  onSubmit: data => console.log(data),
  requireds: ['firstName', 'email']
}

const MyComponent = () => {
  const {
    handleChange,
    handleSubmit
  } = useForm(options)

  return (
    <input
      type='text'
      name='firstName'
      onChange={handleChange}
    />
    <input
      type='email'
      name='email'
      onChange={handleChange}
    />
    <button onClick={handleSubmit}>Submit</button>
  )
}
```

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
  customValidation: {
    firstName: {
      test: value => value.length > 1,
      error: 'First name must be at least 2 characters long'
    }
  }
  // By default, validation will be triggered on blur, but you can also trigger it on change:
  validateOnChange: true
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

      // Make sure to give the same field name as in customValidation:
      name='firstName'
      //

      // If you want to trigger validation on blur (default), use `handleBlur`:
      onBlur={handleBlur}
      //

      // If you set the `validateOnChange` option to `true`:
      onChange={handleChange}
      // (If you don't, you don't even have to use onChange at all!)
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

#### Enforcing rules depending on other form values

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
const { values } = useForm(options(values))
//
```

or declare options directly within your component:

```js
// ...inside the component:
{ values } = useForm({
  customValidation: {
    firstName: {
      test: value => value !== values.lastName,       // Will work too!
      error: 'First name must not be the same as last name'
    }
  }
})

```

#### Enforcing multiple rules in the same field

```js
const { values, handleErrors } = useForm({
  customValidation: {
    firstName: {
      test: value => {
        if (value === values.lastName) {
          handleErrors({
            firstName: 'First name must not be the same as last name'
          })
          return false // Don't forget to return false if test does not pass:
        } else if (value.length < 2) {
          handleErrors({
            firstName: 'First name must be at least 2 characters long'
          })
          return false
        } else return true
      } // No error message needed, because it's handled by the test function
    }
  }
})
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

#### Key listeners

`onKeyDown` can be used to trigger a function when a key is pressed, or override the default behavior of handleSubmit when pressing Enter:

```js
const options = {
  onKeyDown: (e) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed!')
    }
  }
```

## API Reference

### Options

`useForm` accepts a limited number of options to customize its behavior:

- `onSubmit` - Callback function to be called when form is submitted.
- `defaultValues` - Object of field names and their corresponding default values.
- `formName` - A unique `formName` is required if two instances (or more) of `useForm` are concurrently mounted.
- `requireds` - Array of field names that are required. Note that the `required` HTML attribute is ignored.
- `customValidation`- Object of names and their corresponding validation test and optional error message if the test fails. These rules can override the default validation rules. See below for examples.
- `bypassValidation` - Array of field names that will not be tested against validation rules. Note that if required fields are passed, they remain required.
- `onKeyDown` - Function that will be passed to `useForm`'s internal key event listener. If left undefined, `handleSubmit` will be triggered when pressing Enter.
- `disableKeyListener` - Boolean to disable the key listener. If true, will also disable the function passed to onKeyDown.
- `validateDefaultValuesOnMount` - Boolean to validate default values when component is mounted.
- `validateOnChange` - Array of field names to validate when they are changed, not only on blur.
- `validateOnBlur` - Array of field names to validate when they are blurred. If provided, will override default behaviour and disable validation on blur for all fields, except those provided.
- `validateOnSubmit` - Array of field names to validate when form is submitted. If provided, will override default behaviour and disable validation on submit for all fields, except those provided.
- `rerenderOnValidation` - Boolean to rerender the component when any field is validated. Defaults to `true`.
- `rerenderOnChange` - Boolean to rerender the component when form is changed. Defaults to `false`.
- `rerenderOnSubmit` - Boolean to rerender the component when form is submitted. Defaults to `true`.
- `disableRerenders` - Array of field names that, if changed or validated, won't trigger a rerender.
- `resetOnUnmount` - Boolean to reset `values`, `errors` and `valids` when component is unmounted. Defaults to `true`. If set to `false`, please make sure to give a unique `formName` to each instance of `useForm`.

### Returned values

The hook returns an object of properties to be used in your component:

- `values` - Object of field names and their current values.
- `errors` - Object of field names and their current error message. If no error property is present for a given field, this field will be considered valid.
- `valids` - Object of field names and a boolean stating if this field is currently valid or not.
- `validate` - Function that will validate fields against all the validation rules. It will trigger both handleValids & handleErrors (unless `silent` is set to `true`), and will return a boolean stating if the field is valid or not. Prototype: `(name, field, silent) => boolean`
- `validateAll` - Function that will validate all fields against validation rules. Will trigger handleValids & handleErrors to add/remove error messages & validity, and return a boolean stating if all fields are valid or not.
- `validation` - Object of field names and the corresponding validation test(s) that will be enforced. This includes customValidation & standardValidation.
- `handleSubmit` - Function that takes a submit event as argument and calls `onSubmit` if `validateAll` returns `true`.
- `handleChange` - Function that takes a change event as argument and updates the `values` object.
- `handleBlur` - Function that takes a blur event as argument and applies `validate` on the event target.
- `handleChangeCheckbox` - Function that takes a change event from a checkbox input as argument and updates the `values` object.
- `handleFileUpload` - Function that takes a change event from a file upload as argument and updates the `values` object.
- `handleErrors` - Function to manually set the `errors` object.
- `handleValids` - Function to manually set the `valids` object.
- `setValues` - Function to manually set the `values` object (without triggering any validation or rerender).
- `rerender` - Function to manually trigger a rerender.

### Exports

The package's default export is the `useForm` hook. It also exports named exports:

```js
import useForm, { standardValidation, forms, setForms } from '@nononsense/use-form'
```

- `standardValidation` - Function that takes a form's values as argument and returns the standard validation rules & error messages.
- `forms` - The state of all forms used across all instances of `useForm`, which includes `{ values, valids, errors }` for each form name.
- `setForms` - Function to directly mutate the `forms` state if needed.
