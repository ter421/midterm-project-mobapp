import { useState, useCallback, useMemo } from 'react';
import { ApplicationFormData, FormErrors } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

const initialData: ApplicationFormData = {
  fullName: '',
  email: '',
  contactNumber: '',
  whyHire: '',
};

export const useApplicationForm = () => {
  const [formData, setFormData] = useState<ApplicationFormData>(initialData);
  const [touched, setTouched] = useState<Record<keyof ApplicationFormData, boolean>>({
    fullName: false,
    email: false,
    contactNumber: false,
    whyHire: false,
  });

  const validate = useCallback((data: ApplicationFormData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    } else if (!NAME_REGEX.test(data.fullName)) {
      errors.fullName = 'Full name must not contain numbers or special characters.';
    }

    if (!data.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(data.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!data.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required.';
    } else if (!/^\d+$/.test(data.contactNumber)) {
      errors.contactNumber = 'Contact number must contain digits only.';
    } else if (data.contactNumber.length < 10 || data.contactNumber.length > 13) {
      errors.contactNumber = 'Contact number must be 10–13 digits.';
    }

    if (!data.whyHire.trim()) {
      errors.whyHire = 'This field is required.';
    } else if (data.whyHire.trim().length < 20) {
      errors.whyHire = 'Please write at least 20 characters.';
    }

    return errors;
  }, []);

  const errors = useMemo(() => validate(formData), [validate, formData]);

  const visibleErrors: FormErrors = useMemo(() => {
    const result: FormErrors = {};
    (Object.keys(touched) as Array<keyof ApplicationFormData>).forEach(key => {
      if (touched[key] && errors[key]) result[key] = errors[key];
    });
    return result;
  }, [touched, errors]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const updateField = useCallback(
    (field: keyof ApplicationFormData, value: string) =>
      setFormData(prev => ({ ...prev, [field]: value })),
    [],
  );

  const touchField = useCallback(
    (field: keyof ApplicationFormData) =>
      setTouched(prev => ({ ...prev, [field]: true })),
    [],
  );

  const touchAll = useCallback(
    () => setTouched({ fullName: true, email: true, contactNumber: true, whyHire: true }),
    [],
  );

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setTouched({ fullName: false, email: false, contactNumber: false, whyHire: false });
  }, []);

  return { formData, errors: visibleErrors, isValid, updateField, touchField, touchAll, resetForm };
};