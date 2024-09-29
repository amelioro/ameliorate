// Fixes issue where react throws an error if google translate translates a DOM node that has text and sibling content.
// This specifically is known to break the tutorial component.
// See for context: https://github.com/facebook/react/issues/11538#issuecomment-417504600

/* eslint-disable -- copied this so don't care about linting: https://github.com/facebook/react/issues/11538#issuecomment-417504600 */
// @ts-nocheck

// commented out the console logging because we expect to run into this, and it just clutters the console

if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      // if (console) {
      //   console.error("Cannot remove a child from a different parent", child, this);
      // }
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      // if (console) {
      //   console.error(
      //     "Cannot insert before a reference node from a different parent",
      //     referenceNode,
      //     this,
      //   );
      // }
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}
