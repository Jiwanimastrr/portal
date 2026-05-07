import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 상태를 초기화하기 위한 함수 (지연 초기화 지원)
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 컴포넌트 마운트 후 로컬 스토리지에서 값을 읽어옵니다. (SSR 호환성 확보)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // 로컬 스토리지와 상태를 동시에 업데이트하는 래퍼 함수
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 값이 함수인 경우(기존 상태 의존) 현재 상태를 전달하여 평가
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // React 상태 저장
      setStoredValue(valueToStore);
      
      // 로컬 스토리지 저장
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
