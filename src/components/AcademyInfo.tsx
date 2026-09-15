import { ADMISSION_BOOKING_URL, ACADEMY_PHONE_URL, ACADEMY_PLACE_URL } from '../academyLinks';
import { ACADEMY_CONTENT_UPDATED, ACADEMY_FAQS, ACADEMY_LEARNING_SUMMARY, ACADEMY_LEGAL_NAME, ACADEMY_NAME, CONSULTATION_SUMMARY } from '../academyContent';
import { PROGRAM_GUIDE_LINKS } from '../programLinks';
import { AcademyMapLinks } from './AcademyMapLinks';

export function AcademyInfo({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section id="admission" className="academy-info" aria-labelledby="academy-title">
      <div className="academy-info-inner">
        <p className="academy-eyebrow">경기 광주 태전동 · 초등·중등 영어</p>
        <h2 id="academy-title">{ACADEMY_NAME}</h2>
        <p className="academy-intro">{ACADEMY_LEARNING_SUMMARY}</p>
        <p className="academy-name-note">이전에 정철어학원으로 안내되던 태전2캠퍼스의 현재 이름은 윌그로우어학원입니다.</p>
        <div className="consultation-summary"><strong>{CONSULTATION_SUMMARY}</strong><p>네이버 예약 화면에서 알림받기 고객용 무료 레벨테스트 쿠폰과 이용 조건을 확인해 주세요.</p></div>

        <div className="academy-facts">
          <div><h3>초1 파닉스·스피킹</h3><p>윌그로우 자체교재로 파닉스부터 시작합니다. 이중언어 선생님의 스피킹 수업과 읽기·듣기·말하기·쓰기를 연결합니다.</p></div>
          <div><h3>설명하는 문법·중등 내신</h3><p>아이가 직접 설명할 수 있도록 문법을 지도합니다. 중등은 문법·독해를 바탕으로 학교별 내신과 수행평가를 관리합니다.</p></div>
          <div><h3>방문·문의</h3><p>경기도 광주시 태성로 130-1, 304호<br />건물 3층으로 오시면 됩니다.</p><a href={ACADEMY_PHONE_URL}>0507-1356-0671</a></div>
        </div>

        <section id="programs" className="academy-programs" aria-labelledby="programs-title">
          <p className="academy-eyebrow">초등부터 중등까지 이어가는 영어</p>
          <h3 id="programs-title">오래 다닐 영어학원을 찾는다면</h3>
          <p className="academy-programs-intro">지금 시작할 수업과 다음 학년의 학습을 함께 살펴보세요. 윌그로우 태전2는 초1 파닉스, 스피킹과 문법, 중등 내신까지 아이의 학습 단계에 맞는 방향을 상담합니다.</p>
          <div className="academy-program-grid">{PROGRAM_GUIDE_LINKS.map(guide=><a key={guide.slug} href={'/programs/'+guide.slug+'/'}><h4>{guide.label}</h4><p>{guide.summary}</p><span>수업 자세히 보기 ↗</span></a>)}</div>
        </section>

        <section className="academy-comparison" aria-labelledby="academy-comparison-title">
          <h3 id="academy-comparison-title">태전동 초등 영어학원, 수업과 통학을 함께 확인하세요</h3>
          <p>아이에게 필요한 수업과 실제 다닐 수 있는 조건을 함께 살펴보세요. 아래는 윌그로우 태전2캠퍼스의 운영 안내입니다.</p>
          <dl>
            <div><dt>처음 시작하는 영어</dt><dd>자체교재로 초등 1학년 파닉스부터 시작합니다. <a href="/programs/phonics/">파닉스 과정 보기</a></dd></div>
            <div><dt>말하기와 발표</dt><dd>이중언어 선생님의 스피킹 수업과 평소 발표 수업을 운영합니다. <a href="/programs/speaking/">스피킹·발표 수업 보기</a></dd></div>
            <div><dt>문법 이해 확인</dt><dd>아이가 배운 문법을 직접 설명할 수 있도록 지도합니다. <a href="/programs/grammar-middle-school/">문법 학습 보기</a></dd></div>
            <div><dt>다음 학년의 학습</dt><dd>초등학생부터 중학생까지의 과정을 운영합니다. 다음 과정과 반 배정은 현재 학습 상태를 살펴본 뒤 안내합니다.</dd></div>
            <div><dt>셔틀버스 이용</dt><dd>셔틀버스를 운행합니다. 학교와 이용 희망 지역을 알려주시면 운행 여부, 승하차 장소와 시간을 상담에서 확인할 수 있습니다.</dd></div>
          </dl>
          <p>상담·레벨테스트는 약 1시간이며 무료 레벨테스트 쿠폰이 있습니다. <a href={ADMISSION_BOOKING_URL} target="_blank" rel="noopener noreferrer">예약 화면에서 쿠폰 조건과 가능한 일정 확인하기 ↗</a></p>
        </section>

        <section className="admission-steps" aria-labelledby="admission-steps-title">
          <h3 id="admission-steps-title">첫 상담은 이렇게 준비해 주세요</h3>
          <ol>
            <li><span className="step-number" aria-hidden="true">01</span><div><h4>방문할 날짜와 시간 선택</h4><p>네이버의 ‘입학 상담 및 레벨테스트’에서 가능한 일정을 확인하고 예약합니다.</p></div></li>
            <li><span className="step-number" aria-hidden="true">02</span><div><h4>아이의 학습 상황 정리</h4><p>학년, 현재 배우는 내용, 어려워하는 부분을 준비해 주세요. 사전 상담서는 학원에서 안내받으신 경우 작성합니다.</p></div></li>
            <li><span className="step-number" aria-hidden="true">03</span><div><h4>학습 방향 상담</h4><p>현재 영어 수준과 학습 상황을 살펴보고, 배정 가능한 반과 수업 시간을 상담에서 확인합니다.</p></div></li>
          </ol>
        </section>

        <div id="academy-faq" className="academy-faq" aria-labelledby="academy-faq-title">
          <h3 id="academy-faq-title">상담 전에 확인하세요</h3>
          {ACADEMY_FAQS.map(({ id, question, answer }) => (
            <details id={id} key={id}><summary>{question}</summary><p>{answer}</p></details>
          ))}
        </div>

        <div className="academy-actions">
          <a className="btn btn-primary" href={ADMISSION_BOOKING_URL} target="_blank" rel="noopener noreferrer">입학 상담·레벨테스트 예약 ↗</a>
          <a className="academy-guide-link" href={ACADEMY_PHONE_URL}>전화로 문의하기</a>
        </div>
        <AcademyMapLinks />
        <div className="consultation-form-entry"><div><h3>예약 후 사전 상담서</h3><p>학원에서 작성을 안내받으신 분은 아래 상담서를 이용해 주세요.</p></div><button type="button" onClick={onOpenForm}>사전 상담서 작성</button></div>

        <section className="admission-guides" aria-labelledby="admission-guides-title">
          <h3 id="admission-guides-title">상담 전에 더 알아보세요</h3>
          <a href="https://blog.naver.com/willgrowtj/224403803666" target="_blank" rel="noopener noreferrer"><span>입학 상담 안내</span><strong>방문 전 자주 묻는 질문 확인하기 ↗</strong></a>
          <a href="https://blog.naver.com/willgrowtj/224403805020" target="_blank" rel="noopener noreferrer"><span>초6·예비중 영어</span><strong>중학교 진학 전에 확인할 학습 항목 ↗</strong></a>
          <a href="https://blog.naver.com/willgrowtj/224403809315" target="_blank" rel="noopener noreferrer"><span>숙제·오답 관리</span><strong>상담에서 확인할 세 가지 질문 ↗</strong></a>
        </section>
        <p className="academy-legal-name">등록 학원명: {ACADEMY_LEGAL_NAME}</p>
        <div className="academy-source-note">
          <p>{ACADEMY_NAME} 공식 안내 · <time dateTime={ACADEMY_CONTENT_UPDATED}>{ACADEMY_CONTENT_UPDATED.replace(/(\d{4})-(\d{2})-(\d{2})/, (_, year, month, day) => `${year}년 ${Number(month)}월 ${Number(day)}일`)} 업데이트</time></p>
          <p>예약 가능한 일정은 <a href={ADMISSION_BOOKING_URL} target="_blank" rel="noopener noreferrer">네이버 입학 상담 예약</a>, 위치·방문 정보는 <a href={ACADEMY_PLACE_URL} target="_blank" rel="noopener noreferrer">공식 네이버 플레이스</a>에서 확인하세요.</p>
        </div>
      </div>
    </section>
  )
}
