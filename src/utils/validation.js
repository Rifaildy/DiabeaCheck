/**
 * Validation utilities for form inputs
 */

export const validateAge = (age) => {
  const ageNum = Number.parseInt(age);
  if (!age || isNaN(ageNum)) {
    return "Usia harus diisi";
  }
  if (ageNum < 1 || ageNum > 120) {
    return "Usia harus antara 1-120 tahun";
  }
  return null;
};

export const validateGlucose = (glucose) => {
  const glucoseNum = Number.parseFloat(glucose);
  if (!glucose || isNaN(glucoseNum)) {
    return "Kadar glukosa harus diisi";
  }
  if (glucoseNum < 0 || glucoseNum > 300) {
    return "Kadar glukosa harus antara 0-300 mg/dL";
  }
  return null;
};

export const validateBloodPressure = (bloodPressure) => {
  const bpNum = Number.parseFloat(bloodPressure);
  if (!bloodPressure || isNaN(bpNum)) {
    return "Tekanan darah harus diisi";
  }
  if (bpNum < 0 || bpNum > 250) {
    return "Tekanan darah harus antara 0-250 mmHg";
  }
  return null;
};

export const validateBMI = (bmi) => {
  const bmiNum = Number.parseFloat(bmi);
  if (!bmi || isNaN(bmiNum)) {
    return "BMI harus diisi";
  }
  if (bmiNum < 10 || bmiNum > 70) {
    return "BMI harus antara 10-70";
  }
  return null;
};

export const validateSkinThickness = (skinThickness) => {
  if (!skinThickness) return null; // Optional field

  const stNum = Number.parseFloat(skinThickness);
  if (isNaN(stNum)) {
    return "Ketebalan kulit harus berupa angka";
  }
  if (stNum < 0 || stNum > 100) {
    return "Ketebalan kulit harus antara 0-100 mm";
  }
  return null;
};

export const validateInsulin = (insulin) => {
  if (!insulin) return null; // Optional field

  const insulinNum = Number.parseFloat(insulin);
  if (isNaN(insulinNum)) {
    return "Kadar insulin harus berupa angka";
  }
  if (insulinNum < 0 || insulinNum > 1000) {
    return "Kadar insulin harus antara 0-1000 mu U/ml";
  }
  return null;
};

export const validateDiabetesPedigreeFunction = (dpf) => {
  if (!dpf) return null; // Optional field

  const dpfNum = Number.parseFloat(dpf);
  if (isNaN(dpfNum)) {
    return "Fungsi silsilah diabetes harus berupa angka";
  }
  if (dpfNum < 0 || dpfNum > 2.5) {
    return "Fungsi silsilah diabetes harus antara 0.0-2.5";
  }
  return null;
};

export const validatePregnancies = (pregnancies) => {
  if (!pregnancies) return null; // Optional field

  const pregNum = Number.parseInt(pregnancies);
  if (isNaN(pregNum)) {
    return "Jumlah kehamilan harus berupa angka";
  }
  if (pregNum < 0 || pregNum > 20) {
    return "Jumlah kehamilan harus antara 0-20";
  }
  return null;
};

export const validatePredictionForm = (formData) => {
  const errors = {};

  errors.age = validateAge(formData.age);
  errors.glucose = validateGlucose(formData.glucose);
  errors.bloodPressure = validateBloodPressure(formData.bloodPressure);
  errors.bmi = validateBMI(formData.bmi);
  errors.skinThickness = validateSkinThickness(formData.skinThickness);
  errors.insulin = validateInsulin(formData.insulin);
  errors.diabetesPedigreeFunction = validateDiabetesPedigreeFunction(
    formData.diabetesPedigreeFunction
  );
  errors.pregnancies = validatePregnancies(formData.pregnancies);

  // Remove null errors
  Object.keys(errors).forEach((key) => {
    if (errors[key] === null) {
      delete errors[key];
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
