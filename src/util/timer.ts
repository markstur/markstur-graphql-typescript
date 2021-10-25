
export function timer<T>(value: T, ms: number): Promise<T> {
  return new Promise<T>(resolve => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  })
}
