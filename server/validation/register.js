const validator = require('validator')
const isEmpty = require('lodash.isempty')

module.exports = function validateRegisterInput (data) {
  const errors = {}

  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Name must be between 2 and 30 Chars'
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
}
