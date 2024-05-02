import { createContext } from "react";

interface FormContextType {
  submit: () => void;
}

/**
 * Custom context to allow all form components to trigger submit without needing to pass it down through props.
 *
 * React Hook Form has a FormProvider, but unfortunately it doesn't allow you to define a custom submit method for components to trigger.
 * Also tried using form's `watch` to submit on any form change, but that would create an infinite loop
 * when we want to update the form based on outside changes (e.g. right-click hide this node).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const FormContext = createContext<FormContextType>({ submit: () => {} });
