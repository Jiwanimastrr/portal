import { useState, useEffect, useRef } from 'react';
import { SiNaver, SiInstagram } from 'react-icons/si';
import { FiHome, FiMapPin, FiMonitor } from 'react-icons/fi';
import { SiteCard, type SiteInfo } from './components/SiteCard';

const PROGRAMS: SiteInfo[] = [
  {
    id: '1',
    title: '성적표 만들기',
    description: '학생들의 성적과 평가를 간편하게 작성하고 관리할 수 있는 성적표 생성 도구입니다.',
    url: 'https://evaluationsheet.pages.dev/',
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
  },
  {
    id: '9',
    title: 'PDF 스마트 유틸리티',
    description: '여러 개의 PDF를 빠르고 안전하게 병합하고, 분할, 회전, 파일 변환 및 OCR 텍스트 추출 기능을 제공합니다.',
    url: 'http://localhost:8000',
    imageUrl: '/pdf_utility_thumb.png',
    tag: 'Utility'
  },
  {
    id: '10',
    title: '교재 간편 주문',
    description: '수업에 필요한 교재를 빠르게 검색하고 장바구니에 담아 실시간으로 주문할 수 있는 시스템입니다.',
    url: 'https://textbook-order.pages.dev/teacher/order',
    imageUrl: '/placeholder_thumb.png',
    tag: 'Management'
  }
];

function App() {
  const [showPrograms, setShowPrograms] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (cursorRef.current) {
            cursorRef.current.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`;
        }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginPassword(e.target.value);
    setLoginError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === 'jctj8877') {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setShowPrograms(true);
      setLoginPassword('');
      setTimeout(() => {
        document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setLoginError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleTeacherLinkClick = (e: React.MouseEvent) => {
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
      {/* Custom Cursor Text */}
      <div 
        ref={cursorRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 800,
          color: '#0066FF',
          letterSpacing: '1.5px',
          textShadow: '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(0,102,255,0.3)',
          transition: 'transform 0.12s cubic-bezier(0.1, 0.5, 0.1, 1)'
        }}
      >
        WILLGROW
      </div>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand-group">
            <div className="navbar-logo">
              <img src="/logo.png" alt="Willgrow Logo" className="logo-img" />
              <span className="logo-text">윌그로우어학원 태전캠퍼스</span>
            </div>
            
            <div className="navbar-divider"></div>
            
            <div className="navbar-partner">
              <span className="partner-title">국제통번역자원봉사단</span>
              <div className="partner-sub">
                <span className="partner-reg">문화체육관광부 등록(2005-20호)</span>
              </div>
            </div>
          </div>
          <div className="navbar-links">
            <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiHome size={16} />
              홈
            </a>
            <a href="#contact-locations" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiMapPin size={16} />
              오시는 길
            </a>
            <a href="https://blog.naver.com/willgrowtj" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SiNaver size={14} color="#03C75A" />
              블로그
            </a>
            <a href="https://www.instagram.com/willgrow.official.tj" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SiInstagram size={16} color="#E4405F" />
              인스타그램
            </a>
            <a href="#" onClick={handleTeacherLinkClick} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiMonitor size={16} />
              선생님용
            </a>
            <a href="https://willgrow-admission.pages.dev" className="nav-cta" target="_blank" rel="noopener noreferrer">입학 상담</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-video-bg">
          <iframe
            src="https://www.youtube.com/embed/p1-U7eoCEic?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&playsinline=1&loop=1&playlist=p1-U7eoCEic"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-badge">프리미엄 영어 교육</div>
          <h1 className="hero-title">우리 아이의 잠재력을<br/>윌그로우와 함께 깨우세요</h1>
          <p className="hero-subtitle">
            영어로 지식기부의 기회와 경험을 만들어주는 학원
          </p>
          <div className="hero-actions">
            <a href="https://willgrow-admission.pages.dev" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">입학 상담 신청</a>
          </div>
        </div>
      </section>

      {/* Contact / Location Section */}
      <section id="contact-locations" className="contact-locations-section">
        <div className="section-header">
          <h2 className="section-title">오시는 길</h2>
          <p className="section-desc">가까운 윌그로우어학원 캠퍼스를 찾아보세요.</p>
        </div>
        <div className="campus-cards-grid">
          {/* Taegun Campus Card */}
          <a href="https://map.naver.com/p/entry/place/1694768560?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603171634&locale=ko&svcName=map_pcv5" target="_blank" rel="noopener noreferrer" className="campus-card">
            <div className="campus-card-content">
              <h3>📍 태전캠퍼스</h3>
              <p>경기도 광주시 태성로 130-1</p>
              <span className="campus-arrow">길찾기 ➔</span>
            </div>
          </a>

          {/* Gosan Campus Card */}
          <a href="https://map.naver.com/p/entry/place/1251843727?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603171635&locale=ko&svcName=map_pcv5" target="_blank" rel="noopener noreferrer" className="campus-card">
            <div className="campus-card-content">
              <h3>📍 고산캠퍼스</h3>
              <p>경기 광주시 오포안로 409 2층</p>
              <span className="campus-arrow">길찾기 ➔</span>
            </div>
          </a>
        </div>
      </section>



      {/* Programs Section */}
      <section id="programs" className="programs-section">
        <div className="section-header">
          <h2 className="section-title">선생님용</h2>
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
            <div className="navbar-brand-group" style={{ marginBottom: '20px' }}>
              <div className="navbar-logo">
                <img src="/logo.png" alt="Willgrow Logo" className="logo-img" />
                <span className="logo-text">윌그로우어학원 태전캠퍼스</span>
              </div>
              <div className="navbar-divider footer-divider"></div>
              <div className="navbar-partner">
                <span className="partner-title footer-partner-title">국제통번역자원봉사단</span>
                <div className="partner-sub">
                  <span className="partner-reg">문화체육관광부 등록(2005-20호)</span>
                </div>
              </div>
            </div>
            <p className="footer-desc" style={{ marginTop: '0' }}>영어로 지식기부의 기회와 경험을 만들어주는 학원</p>
          </div>
          <div className="footer-links">
            <h3>빠른 링크</h3>
            <a href="#hero" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FiHome size={14} />
              홈
            </a>
            <a href="#contact-locations" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FiMapPin size={14} />
              오시는 길
            </a>
            <a href="https://willgrow-admission.pages.dev" target="_blank" rel="noopener noreferrer">입학 안내</a>
          </div>
          <div className="footer-social">
            <h3>소셜 미디어</h3>
            <a href="https://blog.naver.com/willgrowtj" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <SiNaver size={14} color="#03C75A" />
              네이버 블로그 ↗
            </a>
            <a href="https://www.instagram.com/willgrow.official.tj" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <SiInstagram size={16} color="#E4405F" />
              인스타그램 ↗
            </a>
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
            <p className="footer-phone">
              📞 <a href="tel:0507-1356-0671" className="phone-link">0507-1356-0671</a>
            </p>
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
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={loginPassword} 
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
