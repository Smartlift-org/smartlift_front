import { renderHook, act } from "@testing-library/react-native";
import { useLoadingState } from "../../hooks/useLoadingState";

describe("useLoadingState", () => {
  it("should initialize with default loading state as false", () => {
    const { result } = renderHook(() => useLoadingState());
    
    expect(result.current.isLoading).toBe(false);
  });

  it("should initialize with custom initial state", () => {
    const { result } = renderHook(() => useLoadingState(true));
    
    expect(result.current.isLoading).toBe(true);
  });

  it("should set loading state using setLoading", () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle successful async operation with withLoading", async () => {
    const { result } = renderHook(() => useLoadingState());
    const mockAsyncFunction = jest.fn().mockResolvedValue("success");
    
    let promise: Promise<string | null>;
    
    act(() => {
      promise = result.current.withLoading(mockAsyncFunction);
    });
    
    // During execution, loading should be true
    expect(result.current.isLoading).toBe(true);
    
    const response = await act(async () => {
      return await promise!;
    });
    
    // After completion, loading should be false
    expect(result.current.isLoading).toBe(false);
    expect(response).toBe("success");
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
  });

  it("should handle failed async operation with withLoading", async () => {
    const { result } = renderHook(() => useLoadingState());
    const error = new Error("Async error");
    const mockAsyncFunction = jest.fn().mockRejectedValue(error);
    
    let promise: Promise<string | null>;
    
    act(() => {
      promise = result.current.withLoading(mockAsyncFunction);
    });
    
    // During execution, loading should be true
    expect(result.current.isLoading).toBe(true);
    
    // Should throw the error, wrapped in act
    await act(async () => {
      await expect(promise!).rejects.toThrow("Async error");
    });
    
    // After error, loading should still be false due to finally block
    expect(result.current.isLoading).toBe(false);
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
  });

  it("should handle async function that returns different types", async () => {
    const { result } = renderHook(() => useLoadingState());
    
    // Test with number
    const numberFunction = jest.fn().mockResolvedValue(42);
    const numberResult = await act(async () => {
      return await result.current.withLoading(numberFunction);
    });
    expect(numberResult).toBe(42);
    
    // Test with object  
    const objectFunction = jest.fn().mockResolvedValue({ data: "test" });
    const objectResult = await act(async () => {
      return await result.current.withLoading(objectFunction);
    });
    expect(objectResult).toEqual({ data: "test" });
    
    // Test with null
    const nullFunction = jest.fn().mockResolvedValue(null);
    const nullResult = await act(async () => {
      return await result.current.withLoading(nullFunction);
    });
    expect(nullResult).toBe(null);
  });

  it("should maintain referential stability of functions", () => {
    const { result, rerender } = renderHook(() => useLoadingState());
    
    const firstSetLoading = result.current.setLoading;
    const firstWithLoading = result.current.withLoading;
    
    rerender(undefined);
    
    expect(result.current.setLoading).toBe(firstSetLoading);
    expect(result.current.withLoading).toBe(firstWithLoading);
  });

  it("should handle multiple concurrent withLoading calls", async () => {
    const { result } = renderHook(() => useLoadingState());
    
    const asyncFunction1 = jest.fn().mockResolvedValue("result1");
    const asyncFunction2 = jest.fn().mockResolvedValue("result2");
    
    let promise1: Promise<string | null>;
    let promise2: Promise<string | null>;
    
    act(() => {
      promise1 = result.current.withLoading(asyncFunction1);
      promise2 = result.current.withLoading(asyncFunction2);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    const [result2, result1] = await act(async () => {
      return await Promise.all([promise2!, promise1!]);
    });
    
    expect(result1).toBe("result1");
    expect(result2).toBe("result2");
    expect(result.current.isLoading).toBe(false);
  });
});
