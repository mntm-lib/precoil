export const shallowEqual = (a: any, b: any) => {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  for (const i in a) {
    if (!(i in b)) {
      return false;
    }
  }

  for (const i in b) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
};
