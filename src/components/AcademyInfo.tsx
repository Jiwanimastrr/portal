import { ADMISSION_BOOKING_URL, ACADEMY_PHONE_URL, ACADEMY_PLACE_URL } from '../academyLinks';
import { ACADEMY_CONTENT_UPDATED, ACADEMY_FAQS, ACADEMY_LEGAL_NAME, ACADEMY_NAME, CONSULTATION_SUMMARY } from '../academyContent';

export function AcademyInfo({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section id="admission" className="academy-info" aria-labelledby="academy-title">
      <div className="academy-info-inner">
        <p className="academy-eyebrow">경기 광주 태전동 · 초등·중등 영어</p>
        <h2 id="academy-title">{ACADEMY_NAME}</h2>
        <p className="academy-intro">입학 상담과 레벨테스트를 통해 현재 영어 수준을 살펴보고, 아이의 학년과 학습 상태에 맞는 수업과 학습 방향을 안내합니다.</p>
        <p className="academy-name-note">이전에 정철어학원으로 안내되던 태전2캠퍼스의 현재 이름은 윌그로우어학원입니다.</p>
        <div className="consultation-summary"><strong>{CONSULTATION_SUMMARY}</strong><p>쿠폰 이용 방법은 예약 전에 학원으로 문의해 주세요.</p></div>

        <div className="academy-facts">
          <div><h3>초등 영어</h3><p>영어의 기초를 다지고 읽기·듣기·말하기·쓰기를 연결합니다. 원서 읽기, 발표와 토론을 통해 배운 영어를 사용하는 수업을 안내합니다.</p></div>
          <div><h3>중등 영어</h3><p>문법과 독해를 바탕으로 학교별 내신과 수행평가를 관리하는 과정을 안내합니다.</p></div>
          <div><h3>방문·문의</h3><p>경기도 광주시 태성로 130-1, 304호<br />건물 3층으로 오시면 됩니다.</p><a href={ACADEMY_PHONE_URL}>0507-1356-0671</a></div>
        </div>

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
          <a className="academy-guide-link" href={ACADEMY_PLACE_URL} target="_blank" rel="noopener noreferrer">네이버에서 위치 확인 ↗</a>
        </div>
        <div className="consultation-form-entry"><div><h3>예약 후 사전 상담서</h3><p>학원에서 작성을 안내받으신 분은 아래 상담서를 이용해 주세요.</p></div><button type="button" onClick={onOpenForm}>사전 상담서 작성</button></div>

        <section className="admission-guides" aria-labelledby="admission-guides-title">
          <h3 id="admission-guides-title">상담 전에 더 알아보세요</h3>
          <a href="https://blog.naver.com/willgrowtj/224403803666" target="_blank" rel="noopener noreferrer"><span>입학 상담 안내</span><strong>방문 전 자주 묻는 질문 확인하기 ↗</strong></a>
          <a href="https://blog.naver.com/willgrowtj/224403805020" target="_blank" rel="noopener noreferrer"><span>초6·예비중 영어</span><strong>중학교 진학 전에 확인할 학습 항목 ↗</strong></a>
          <a href="https://blog.naver.com/willgrowtj/224403809315" target="_blank" rel="noopener noreferrer"><span>숙제·오답 관리</span><strong>상담에서 확인할 세 가지 질문 ↗</strong></a>
        </section>
        <p className="academy-legal-name">등록 학원명: {ACADEMY_LEGAL_NAME}</p>
        <div className="academy-source-note">
          <p>{ACADEMY_NAME} 공식 안내 · <time dateTime={ACADEMY_CONTENT_UPDATED}>2026년 9월 9일 업데이트</time></p>
          <p>예약 가능한 일정은 <a href={ADMISSION_BOOKING_URL} target="_blank" rel="noopener noreferrer">네이버 입학 상담 예약</a>, 위치·방문 정보는 <a href={ACADEMY_PLACE_URL} target="_blank" rel="noopener noreferrer">공식 네이버 플레이스</a>에서 확인하세요.</p>
        </div>
      </div>
    </section>
  )
}
