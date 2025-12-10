/**
 * This allows us to hide other hover-to-show elements when we're hovering one that's interactable.
 *
 * Generally if an element is interactable and we hover, it seems nicer to hide other interactable
 * things so that we can more clearly see what we're about to interact with.
 *
 * For example, when we hover a node, we show the add node buttons. But if we hover an indicator,
 * which has its own hover/click effects, it's nicer if we hide the add node buttons, because at
 * that time we don't really benefit from seeing them.
 *
 * We considered moving all interactable elements outside of being a child of the node, but many of
 * them are positioned relative to the node and don't make sense to popper out (e.g. indicators), so
 * they need to be children of the node container element.
 */
export const interactableClass = "interactable";

// keep these next to `interactableClass` because tailwind doesn't let us reference the `interactableClass` variable and we need to hardcode the class as a string
// `String.raw` in order to allow underscores to be escaped for tailwind, so they don't get converted to spaces
export const visibleOnNodeHoverSelectedClasses = String.raw` [.react-flow\_\_node:not(:has(:not(&).interactable:hover)):hover_&]:visible [.react-flow\_\_node:has(.diagram-node.selected)_&]:visible`;
