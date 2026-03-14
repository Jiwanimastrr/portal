import { SiteCard, type SiteInfo } from './components/SiteCard';

const DUMMY_SITES: SiteInfo[] = [
  {
    id: '1',
    title: '성적표 만들기',
    description: '학생들의 성적과 평가를 간편하게 작성하고 관리할 수 있는 성적표 생성 도구입니다.',
    url: '/report_card.html',
    imageUrl: '/report_card_thumb.png',
    tag: 'Management'
  },
  {
    id: '2',
    title: '파닉스 플립북',
    description: '아이들이 즐겁게 파닉스 규칙을 익힐 수 있는 반응형 디지털 플립북입니다.',
    url: 'https://phonics-flipbook.pages.dev',
    imageUrl: '/phonics_flipbook_thumb.png',
    tag: 'Phonics'
  },
  {
    id: '3',
    title: '내신 트래커',
    description: '학생들의 내신 성적 변화 추이와 학습 진행 상황을 체계적으로 추적하고 관리합니다.',
    url: 'https://examflow-5do.pages.dev',
    imageUrl: '/exam_flow_thumb.png',
    tag: 'Tracker'
  },
  {
    id: '4',
    title: '통번역 교재 인쇄',
    description: '학원 전용 통번역 학습 교재를 원하는 세션에 맞춰 깔끔하게 인쇄 포맷으로 생성합니다.',
    url: 'https://ivotextbook0313.jiwanism.workers.dev',
    imageUrl: '/ivotextbook_thumb.png',
    tag: 'Material'
  },
  {
    id: '5',
    title: '통번역 수업 프로그램',
    description: '체계적인 영어 해석 및 번역, 롤플레이 학습을 지원하는 쌍방향 수업 툴입니다.',
    url: 'https://willgrow-translation2-0.jiwanism.workers.dev',
    imageUrl: '/willgrow_translation_thumb.png',
    tag: 'Learning'
  },
  {
    id: '6',
    title: '통번역 받아쓰기',
    description: '오디오를 듣고 딕테이션 훈련을 할 수 있는 주니어 레벨 전용 받아쓰기 앱입니다.',
    url: 'https://junior-dictation.jiwanism.workers.dev',
    imageUrl: '/junior_dictation_thumb.png',
    tag: 'Listening'
  },
  {
    id: '7',
    title: '입학 상담서',
    description: '신규 원생 학부모님 대상 맞춤형 입학 상담 및 안내를 지원하는 스마트 폼입니다.',
    url: 'https://willgrow-admission.pages.dev',
    imageUrl: '/willgrow_admission_thumb.png',
    tag: 'Admission'
  }
];

function App() {
  return (
    <div className="portal-container">
      <header className="portal-header">
        <img src="/logo.png" alt="Willgrow Logo" className="portal-logo" />
        <h1 className="portal-title">EDU PORTAL</h1>
      </header>
      
      <main className="sites-grid">
        {DUMMY_SITES.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </main>
    </div>
  );
}

export default App;
