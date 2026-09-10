import { ACADEMY_PLACE_URL, ACADEMY_KAKAO_MAP_URL, ACADEMY_GOOGLE_MAP_URL } from '../academyLinks';

export function AcademyMapLinks() {
  return <nav className="academy-map-links" aria-label="태전2캠퍼스 지도에서 위치 확인">
    <a href={ACADEMY_PLACE_URL} target="_blank" rel="noopener noreferrer">네이버 지도 ↗</a>
    <a href={ACADEMY_KAKAO_MAP_URL} target="_blank" rel="noopener noreferrer">카카오 지도 ↗</a>
    <a href={ACADEMY_GOOGLE_MAP_URL} target="_blank" rel="noopener noreferrer">구글 지도 ↗</a>
  </nav>;
}
