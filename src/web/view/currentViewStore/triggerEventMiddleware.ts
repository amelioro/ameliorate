import { StateCreator, StoreMutatorIdentifier } from "zustand";

import { emitter } from "@/web/common/event";
import { ViewState } from "@/web/view/currentViewStore/store";

type TriggerEvent = <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  create: StateCreator<ViewState, Mps, Mcs>
) => StateCreator<ViewState, Mps, Mcs>;

type TriggerEventImpl = (f: StateCreator<ViewState>) => StateCreator<ViewState>;

// types taken from https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#middleware-that-doesnt-change-the-store-type
const triggerEventImpl: TriggerEventImpl = (create) => (set, get, api) => {
  // There's a `set` and `get` passed by the store to its methods,
  // and there's a `setState` and `getState` that is defined on the store separately.
  // We want our middleware to run if `setState` is called because our "no store actions" pattern
  // relies on `setState`, but we might as well override `set` too in case we ever want to use that.
  // Tried extracting the code into a reusable function, but that seemed hard to read, so we're just
  // duplicating it here.
  const triggerEventSet: typeof set = (args) => {
    set(args);
    const newView = get();

    emitter.emit("changedView", newView);
  };

  const origSetState = api.setState;
  // eslint-disable-next-line functional/immutable-data, no-param-reassign -- mutation required https://github.com/pmndrs/zustand/issues/881#issuecomment-1076957006
  api.setState = (args) => {
    origSetState(args);
    const newView = get();

    emitter.emit("changedView", newView);
  };

  return create(triggerEventSet, get, api);
};

export const triggerEvent = triggerEventImpl as unknown as TriggerEvent;
