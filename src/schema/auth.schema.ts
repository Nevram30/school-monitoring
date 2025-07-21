import * as yup from 'yup'

export const nameValidator = yup
  .string()
  .required('Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')

export const passwordValidator = yup
  .string()
  .required('Password is required')

export default yup.object({
  name: nameValidator,
  password: passwordValidator,
})
