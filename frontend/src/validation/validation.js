export const phoneValidator = (_, value) => {
  if (!value) return Promise.reject(new Error('Phone is required'));
  if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
    return Promise.reject(new Error('Phone must be 10 digits'));
  }
  return Promise.resolve();
};

export const gstValidator = (_, value) => {
  if (!value) return Promise.resolve();
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
    return Promise.reject(new Error('Invalid GST number'));
  }
  return Promise.resolve();
};

export const panValidator = (_, value) => {
  if (!value) return Promise.resolve();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
    return Promise.reject(new Error('Invalid PAN number'));
  }
  return Promise.resolve();
};