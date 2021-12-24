import { act, renderHook } from "@testing-library/react-hooks";
import { useMap } from "../src/useMap";

describe("useMap", () => {
  describe("set", () => {
    it("should update an existing key-value pair", () => {
      const { result } = renderHook(() =>
        useMap<number, string>([[1, "default"]])
      );
      const [, { set }] = result.current;
      expect(result.current[0].get(1)).toBe("default");
      act(() => set(1, "changed"));
      expect(result.current[0].get(1)).toBe("changed");
    });
    it("should add a new key-value pair", () => {
      const { result } = renderHook(() => useMap<number, string>());
      const [, { set }] = result.current;
      expect(result.current[0].get(1)).toBeUndefined();
      act(() => set(1, "added"));
      expect(result.current[0].get(1)).toBe("added");
    });
  });

  describe("delete", () => {
    it("should delete an existing key-value pair", () => {
      const { result } = renderHook(() =>
        useMap<number, string>([[1, "existing"]])
      );
      const [, { delete: deleteByKey }] = result.current;
      expect(result.current[0].get(1)).toBe("existing");
      act(() => deleteByKey(1));
      expect(result.current[0].get(1)).toBeUndefined();
    });
  });

  describe("initialize", () => {
    // The first row of the table defines the variable names used in the tests. `|` separates columns.
    // https://jestjs.io/docs/api#2-testeachtablename-fn-timeout
    // Two tests:
    // * For the "map" test, we initialize the map with the map `Map([[1, "initialized"]])`.
    // * For the "tuple" test, we initialize the map with the tuple `[1, "initialized"]`.
    it.each`
      message    | input
      ${"map"}   | ${new Map([[1, "initialized"]])}
      ${"tuple"} | ${[[1, "initialized"]]}
    `("should initialize with a $message", ({ input }) => {
      const { result } = renderHook(() => useMap<number, string>());
      const [, { initialize }] = result.current;
      expect(result.current[0].get(1)).toBeUndefined();
      act(() => initialize(input));
      expect(result.current[0].get(1)).toBe("initialized");
    });
  });

  describe("clear", () => {
    it("should clear all key-value pairs", () => {
      const { result } = renderHook(() =>
        useMap<number, string>([[1, "initialized"]])
      );
      const [, { clear }] = result.current;
      expect(result.current[0].get(1)).toBe("initialized");
      act(() => clear());
      expect(result.current[0].get(1)).toBeUndefined();
    });
  });

  describe("hook optimizations", () => {
    it("should change value reference equality after change", () => {
      const { result } = renderHook(() => useMap<number, number>());
      const [originalValueReference, { set }] = result.current;
      expect(result.current[0]).toBe(originalValueReference);
      act(() => set(1, 1));
      expect(originalValueReference).not.toBe(result.current[0]);
      expect(originalValueReference.get(1)).toBeUndefined();
      expect(result.current[0].get(1)).toBe(1);
    });
  });

  it("should keep actions reference equality after value change", () => {
    const { result } = renderHook(() => useMap<number, number>());
    const [, originalActionsReference] = result.current;
    expect(result.current[1]).toBe(originalActionsReference);
    act(() => originalActionsReference.set(1, 1));
    expect(originalActionsReference).toBe(result.current[1]);
  });
});
