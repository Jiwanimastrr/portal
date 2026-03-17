import { useState } from 'react';
import { SiNaver, SiInstagram } from 'react-icons/si';
import { FiHome, FiMapPin, FiMonitor } from 'react-icons/fi';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginPassword(e.target.value);
    setLoginError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === 'jctj8877') {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setLoginPassword('');
    } else {
      setLoginError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleTeacherLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="landing-container">
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
