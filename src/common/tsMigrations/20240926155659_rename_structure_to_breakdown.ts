// feels a little awkward putting migrations in `common`, but this allows the same code to migrate db and store data

/* eslint-disable -- don't really care to make this file meet eslint standards, since types are changing between each migration */

export interface FromViewState1 {
  categoriesToShow: ("structure" | "research" | "justification")[];
  structureFilter?: object;
  generalFilter: {
    showSecondaryStructure?: boolean;
  };
}

export interface ToViewState2 {
  categoriesToShow: ("breakdown" | "research" | "justification")[];
  breakdownFilter: object;
  generalFilter: {
    showSecondaryBreakdown: boolean;
  };
}

// rename structure -> breakdown
export const renameStructureToBreakdown = (state: FromViewState1) => {
  (state as ToViewState2).categoriesToShow = state.categoriesToShow.map((category) =>
    category === "structure" ? "breakdown" : category,
  );

  // ensure idempotency to prevent problems if this is run against db multiple times
  if (state.structureFilter !== undefined) {
    (state as ToViewState2).breakdownFilter = state.structureFilter!;
    delete state.structureFilter;
  }

  // ensure idempotency to prevent problems if this is run against db multiple times
  if (state.generalFilter.showSecondaryStructure !== undefined) {
    (state as ToViewState2).generalFilter.showSecondaryBreakdown =
      state.generalFilter.showSecondaryStructure!;
    delete state.generalFilter.showSecondaryStructure;
  }

  return state;
};
