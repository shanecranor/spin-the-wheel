import { observable } from "@legendapp/state";

export function getRandomInt() {
  const buffer = new Uint32Array(1);
  window.crypto.getRandomValues(buffer);
  return buffer[0];
}

interface SpecObserver<T = unknown, E = unknown> {
  next: (value: T) => void;
  error: (error: E) => void;
  complete: () => void;
}

interface SpecSubscription {
  unsubscribe(): void;
  closed?: boolean;
}

interface SpecObservable<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe: (observer: SpecObserver<T, any>) => SpecSubscription;
}

export function fromSpecObservable<T = unknown>(
  specObservable: SpecObservable<T>,
  initialValue?: T
) {
  const obs$ = observable<T>(initialValue);
  specObservable.subscribe({
    next: (value) => {
      obs$.set(() => value);
    },
    error: () => void null,
    complete: () => void null,
  });

  return obs$;
}
