// Public facts shared by the visible answers and the structured page description.
// Update the date only when public content changes, not on every deployment.
export const ACADEMY_CONTENT_UPDATED = '2026-09-09';
export const ACADEMY_NAME = '윌그로우어학원 태전2국제캠퍼스';
export const ACADEMY_LEGAL_NAME = '윌그로우태전2국제캠퍼스어학원';
export const ACADEMY_SITE_URL = 'https://willgrow.pages.dev/';
export const CONSULTATION_SUMMARY = '레벨테스트 무료 쿠폰이 있으며, 상담·레벨테스트는 약 1시간 소요됩니다.';

export const ACADEMY_FAQS = [
  {
    id: 'academy-name',
    question: '태전2캠퍼스의 정철어학원과 윌그로우어학원은 같은 곳인가요?',
    answer: '이전에 정철어학원으로 안내되던 태전2캠퍼스의 현재 이름은 윌그로우어학원입니다. 등록 학원명은 윌그로우태전2국제캠퍼스어학원이며, 이 페이지는 태전2국제캠퍼스의 입학·방문 안내입니다.',
  },
  {
    id: 'elementary-english',
    question: '태전동 초등 영어 수업에서는 무엇을 배우나요?',
    answer: '윌그로우어학원 태전2국제캠퍼스의 초등 영어는 기초를 다지며 읽기·듣기·말하기·쓰기를 연결합니다. 원서 읽기, 발표와 토론을 통해 배운 영어를 사용하는 수업을 안내합니다. 아이의 현재 학습 상태에 맞는 과정은 입학 상담에서 확인할 수 있습니다.',
  },
  {
    id: 'middle-school-english',
    question: '중등 영어와 내신 준비도 상담할 수 있나요?',
    answer: '네. 윌그로우어학원 태전2국제캠퍼스는 문법과 독해를 바탕으로 학교별 내신과 수행평가를 관리하는 중등 영어 과정을 안내합니다. 상담할 때 학교·학년과 현재 어려워하는 부분을 알려주세요.',
  },
  {
    id: 'first-booking',
    question: '처음 방문할 때 어떤 예약을 선택하나요?',
    answer: '이 페이지의 입학 상담·레벨테스트 예약 버튼은 신규 상담 예약 화면으로 연결됩니다. 네이버 플레이스에서는 입학 상담 및 레벨테스트를 선택해 주세요. 선생님 이름이 적힌 보충수업 예약은 재원생용입니다.',
  },
  {
    id: 'consultation-preparation',
    question: '상담할 때 무엇을 알려주면 되나요?',
    answer: '아이의 학교·학년, 현재 배우는 내용과 어려운 부분, 방문 가능한 시간을 알려주세요. 배정 가능한 반과 수업 시간은 현재 영어 수준과 학습 상황을 살펴본 뒤 상담에서 확인할 수 있습니다.',
  },
  {
    id: 'consultation-fee-time',
    question: '레벨테스트 무료 쿠폰이 있나요? 상담은 얼마나 걸리나요?',
    answer: `${CONSULTATION_SUMMARY} 무료 쿠폰의 이용 방법은 예약 전에 학원 전화 0507-1356-0671로 문의해 주세요. 방문 가능한 일정은 네이버의 입학 상담 및 레벨테스트 예약 화면에서 확인할 수 있습니다.`,
  },
  {
    id: 'pre-consultation-form',
    question: '상세 상담서를 먼저 작성해야 하나요?',
    answer: '첫 방문 일정은 네이버에서 예약할 수 있습니다. 상세 상담서는 예약 후 학원에서 작성 안내를 받으신 경우에 이용해 주세요.',
  },
  {
    id: 'taejeon2-address',
    question: '윌그로우어학원 태전2국제캠퍼스는 어디에 있나요?',
    answer: '경기도 광주시 태성로 130-1, 건물 3층 304호입니다. 이 페이지의 입학 상담 예약과 전화 문의는 태전2국제캠퍼스 안내입니다. 오시는 길의 태전2국제캠퍼스 지도를 선택해 주세요.',
  },
  {
    id: 'parking',
    question: '차를 가지고 방문해도 되나요?',
    answer: '건물 주차장을 무료로 이용할 수 있습니다. 주차 후 경기도 광주시 태성로 130-1, 건물 3층 304호로 오시면 됩니다.',
  },
] as const;
