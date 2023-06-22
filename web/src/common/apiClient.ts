import { ZodiosHooks } from "@zodios/react";

import { createApiClient } from "../../../common/api-schema/zodios";

// swagger is awful for Topic with partial User, no User, etc. just turn off validation.
export const apiClient = createApiClient("http://localhost:3001", { validate: false });
export const apiHooks = new ZodiosHooks("ameliorateApiClient", apiClient);
