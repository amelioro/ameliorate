# State Management Patterns

Zustand stores are used to manage front-end state. Check out the [Zustand documentation](https://docs.pmnd.rs/zustand/getting-started/introduction) for details about how it works. There are a few different pieces that make up our state management: the store, its actions, and its hooks.

## The store itself

This has the state in it.

Here is an example of a simple store we have for managing some user config:

```ts
// Define the shape of the state that the store will manage.
// In this case, we have simple boolean config that the user can set to control some UX features.
interface UserConfigStoreState {
  fillNodesWithColor: boolean;
  indicateWhenNodeForcedToShow: boolean;
}

// Define the initial state of the store.
// Sometimes this is additionally used to reset the store.
const initialState: UserConfigStoreState = {
  fillNodesWithColor: false,
  indicateWhenNodeForcedToShow: false,
};

// Create the store.
const useUserConfigStore = create<UserConfigStoreState>()(
  // `persist` is special middleware to persist the store state to local storage, so it's not lost
  // when the user closes their browser window, or navigates away.
  // docs from Zustand on this here: https://github.com/pmndrs/zustand#persist-middleware
  persist(() => initialState, {
    name: "user-config-storage",
  }),
);
```

## Actions

These are functions that update the state

- generally these should be invoked from a component (e.g. clicking the add node button will invoke the addNode action)
- some actions just read the current state (different from hooks because they don't subscribe to changes)
- these follow the [separate actions from store pattern](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- generally these will look something like

```ts
// actions
export const toggleFillNodesWithColor = (fill: boolean) => {
  // `setState` is how a store's state changes - when this is invoked, every component that uses
  // state from this store will check to see if the data it's relying on changed, and if so, re-render.
  useUserConfigStore.setState({ fillNodesWithColor: fill });

  // Note 1: oftentimes, we need to take into account the store's current state. Typically we'll use
  // `const state = useUserConfigStore.getState();` to get access to it.

  // We can also pass a function to `setState` that receives the current state as an argument like so:
  // `useUserConfigStore.setState((oldState) => ({ fillNodesWithColor: !oldState.fillNodesWithColor }));`
  // but that's more of an older pattern in this codebase.

  // Note 2: if you see other parameters passed to `setState`, likely the store is using some form
  // of middleware - you can find info on these parameters by:
  // 1. identify which middleware is being used by looking at the code used to `create` the store
  // 2. search Zustand docs for the middleware's name (or if it's Ameliorate-specific middleware,
  // go to the middleware's file to read about it).
};

export const toggleIndicateWhenNodeForcedToShow = (indicate: boolean) => {
  useUserConfigStore.setState({ indicateWhenNodeForcedToShow: indicate });
};
```

## Hooks

These are functions that subscribe to changes in the state

- generally these should be used from a component to render something based on state in the store - when the hook returns a different value, the component will re-render
- these follow the [only export custom hooks pattern](https://tkdodo.eu/blog/working-with-zustand#only-export-custom-hooks), so components shouldn't ever directly invoke `useStore`
- these will look something like

```ts
// hooks
export const useFillNodesWithColor = () => {
  return useUserConfigStore((state) => state.fillNodesWithColor);
};

export const useIndicateWhenNodeForcedToShow = () => {
  return useUserConfigStore((state) => state.indicateWhenNodeForcedToShow);
};
```

- note: for hooks that copy an object or create a new array, and therefore have new object/array
  references each time the hook is invoked, consider passing a shallow comparison fn to prevent extra re-renders (see zustand [docs](https://github.com/pmndrs/zustand#selecting-multiple-state-slices))

### Zombie child issue

- hooks should generally not throw errors, particularly due to the [zombie child issue](https://github.com/pmndrs/zustand/issues/302)
  - e.g. if a node is deleted from state, the node's component will have a re-render triggered due to the state change, but hooks looking for that node will not find it; in this case, the hook should just return something that doesn't error - the node's component will soon be removed from the DOM by re-render of the parent Diagram component
