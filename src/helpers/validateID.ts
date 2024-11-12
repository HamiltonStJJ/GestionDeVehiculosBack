export const validateID = (cedula: string): boolean => {
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }
  const provinceCode = parseInt(cedula.substring(0, 2), 10);
  const thirdDigit = parseInt(cedula[2], 10);

  if (!(provinceCode >= 1 && provinceCode <= 24) && provinceCode !== 30) {
    return false;
  }

  if (thirdDigit < 0 || thirdDigit > 6) {
    return false;
  }

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cedula[i], 10) * coefficients[i];
    if (digit > 9) {
      digit -= 9;
    }
    sum += digit;
  }

  const verifier = parseInt(cedula[9], 10);
  const calculatedVerifier = 10 - (sum % 10);

  return verifier === (calculatedVerifier === 10 ? 0 : calculatedVerifier);
};
