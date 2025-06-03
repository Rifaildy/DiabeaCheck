/**
 * Validation utilities for medical data
 */

const validateMedicalData = (data) => {
  const errors = [];

  // Age validation
  if (!data.age || data.age < 1 || data.age > 120) {
    errors.push("Age must be between 1 and 120 years");
  }

  // Glucose validation
  if (!data.glucose || data.glucose < 0 || data.glucose > 300) {
    errors.push("Glucose level must be between 0 and 300 mg/dL");
  }

  // Blood pressure validation
  if (
    !data.bloodPressure ||
    data.bloodPressure < 0 ||
    data.bloodPressure > 250
  ) {
    errors.push("Blood pressure must be between 0 and 250 mmHg");
  }

  // BMI validation
  if (!data.bmi || data.bmi < 10 || data.bmi > 70) {
    errors.push("BMI must be between 10 and 70");
  }

  // Optional field validations
  if (
    data.skinThickness &&
    (data.skinThickness < 0 || data.skinThickness > 100)
  ) {
    errors.push("Skin thickness must be between 0 and 100 mm");
  }

  if (data.insulin && (data.insulin < 0 || data.insulin > 1000)) {
    errors.push("Insulin level must be between 0 and 1000 mu U/ml");
  }

  if (
    data.diabetesPedigreeFunction &&
    (data.diabetesPedigreeFunction < 0 || data.diabetesPedigreeFunction > 2.5)
  ) {
    errors.push("Diabetes pedigree function must be between 0.0 and 2.5");
  }

  if (data.pregnancies && (data.pregnancies < 0 || data.pregnancies > 20)) {
    errors.push("Number of pregnancies must be between 0 and 20");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const sanitizeInput = (data) => {
  return {
    age: Number.parseFloat(data.age) || 0,
    glucose: Number.parseFloat(data.glucose) || 0,
    bloodPressure: Number.parseFloat(data.bloodPressure) || 0,
    skinThickness: Number.parseFloat(data.skinThickness) || 0,
    insulin: Number.parseFloat(data.insulin) || 0,
    bmi: Number.parseFloat(data.bmi) || 0,
    diabetesPedigreeFunction:
      Number.parseFloat(data.diabetesPedigreeFunction) || 0,
    pregnancies: Number.parseInt(data.pregnancies) || 0,
  };
};

module.exports = {
  validateMedicalData,
  sanitizeInput,
};
