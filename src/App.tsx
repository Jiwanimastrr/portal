import { useState } from 'react';
import { SiteCard, type SiteInfo } from './components/SiteCard';

const PROGRAMS: SiteInfo[] = [
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
  },
  {
    id: '8',
    title: '학교별 하교 시간 안내',
    description: '초등학교 및 중학교의 학교별, 학년별, 요일별 하교 시간과 교시를 한 눈에 확인할 수 있습니다.',
    url: '/학교스케줄.html',
    imageUrl: '/school_schedule_thumb.png',
    tag: 'Schedule'
  }
];

function App() {
  const [showPrograms, setShowPrograms] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      // Allow only English and auto-capitalize first letter
      let formatted = value.replace(/[^a-zA-Z]/g, '');
      if (formatted.length > 0) {
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
      }
      setLoginForm(prev => ({ ...prev, name: formatted }));
    } else {
      setLoginForm(prev => ({ ...prev, [name]: value }));
    }
    setLoginError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.password === 'jctj8877') {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setShowPrograms(true);
      setLoginForm({ name: '', password: '' });
      setTimeout(() => {
        document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setLoginError('비밀번호가 올바르지 않습니다.');
    }
  };

  const togglePrograms = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setShowPrograms(!showPrograms);
    // Smooth scroll specifically to programs section if opening
    if (!showPrograms) {
      setTimeout(() => {
        document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src="/logo.png" alt="Willgrow Logo" className="logo-img" />
            <span className="logo-text">윌그로우어학원 태전캠퍼스</span>
          </div>
          <div className="navbar-links">
            <a href="#hero">홈</a>
            <a href="#programs" onClick={togglePrograms}>Teachers' programs</a>
            <a href="#contact">오시는 길</a>
            <a href="https://willgrow-admission.pages.dev" className="nav-cta" target="_blank" rel="noopener noreferrer">입학 상담</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">프리미엄 영어 교육</div>
          <h1 className="hero-title">당신의 잠재력을<br/>윌그로우와 함께 깨우세요</h1>
          <p className="hero-subtitle">
            영어로 지식기부의 기회와 경험을 만들어주는 학원
          </p>
          <div className="hero-actions">
            <a href="#programs" className="btn btn-primary" onClick={togglePrograms}>
              {showPrograms ? 'Teachers\' programs 닫기' : 'Teachers\' programs 알아보기'}
            </a>
            <a href="https://willgrow-admission.pages.dev" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">입학 상담 신청</a>
          </div>
        </div>
        <div className="hero-visual">
          {/* Decorative glass elements */}
          <div className="glass-shape shape-1"></div>
          <div className="glass-shape shape-2"></div>
          <div className="glass-shape shape-3"></div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="programs-section">
        <div className="section-header">
          <h2 className="section-title">Teachers' programs</h2>
          <p className="section-desc">영어 실력을 확실하게 키워줄 다양한 교육 도구와 리소스를 만나보세요.</p>
        </div>
        
        {showPrograms && (
          <div className="programs-grid">
            {PROGRAMS.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="navbar-logo">
              <img src="/logo.png" alt="Willgrow Logo" className="logo-img" />
              <span className="logo-text">윌그로우어학원 태전캠퍼스</span>
            </div>
            <p className="footer-desc">영어로 지식기부의 기회와 경험을 만들어주는 학원</p>
          </div>
          <div className="footer-links">
            <h3>빠른 링크</h3>
            <a href="#hero">홈</a>
            <a href="#programs">Teachers' programs</a>
            <a href="https://willgrow-admission.pages.dev" target="_blank" rel="noopener noreferrer">입학 안내</a>
          </div>
          <div className="footer-contact">
            <h3>오시는 길</h3>
            <div className="campus-links">
              <p>
                📍 <a href="https://map.naver.com/p/entry/place/1694768560?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603171634&locale=ko&svcName=map_pcv5" target="_blank" rel="noopener noreferrer" className="map-link">태전캠퍼스: 경기도 광주시 태성로 130-1</a>
              </p>
              <p>
                📍 <a href="https://map.naver.com/p/entry/place/1251843727?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603171635&locale=ko&svcName=map_pcv5" target="_blank" rel="noopener noreferrer" className="map-link">고산캠퍼스: 경기 광주시 오포안로 409 2층</a>
              </p>
            </div>
            <p className="footer-phone">📞 0507-1356-0671</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Willgrow Language Institute. All rights reserved.</p>
        </div>
      </footer>

      {/* Teacher Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Teacher Login</h3>
              <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            </div>
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label>English Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={loginForm.name} 
                  onChange={handleLoginChange} 
                  placeholder="예: John (영어 이름만 입력)" 
                  autoComplete="off"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={loginForm.password} 
                  onChange={handleLoginChange} 
                  placeholder="비밀번호 입력"
                  required 
                />
              </div>
              {loginError && <p className="error-msg">{loginError}</p>}
              <button type="submit" className="btn btn-primary login-btn">Login</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
