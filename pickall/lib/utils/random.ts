/**
 * 안전한 난수 생성을 위한 유틸리티 함수들
 */

/**
 * 0 이상 max 미만의 정수형 난수를 반환합니다. (Math.random() * max 와 동일한 역할)
 * crypto.getRandomValues 를 사용하여 더 높은 무작위성을 보장합니다.
 */
export function secureRandom(max: number): number {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

/**
 * Fisher-Yates 알고리즘과 crypto.getRandomValues를 사용하여 배열을 섞습니다.
 */
export function secureShuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
