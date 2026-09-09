import { ACADEMY_CONTENT_UPDATED, ACADEMY_NAME, CONSULTATION_SUMMARY } from '../academyContent';
import { ADMISSION_BOOKING_URL, ACADEMY_PHONE_URL, ACADEMY_PLACE_URL } from '../academyLinks';
import { PROGRAM_GUIDES } from '../programContent';
import type { ProgramGuide } from '../programContent';

export function ProgramGuidePage({ guide }: { guide: ProgramGuide }) {
  return <div className="program-page">
    <a className="program-skip" href="#program-content">본문 바로가기</a>
    <header className="program-header"><a className="program-brand" href="/"><img src="/logo.png" alt="윌그로우어학원 로고" width="44" height="44" /><span>윌그로우어학원<small>태전2국제캠퍼스</small></span></a><a className="program-booking" href={ADMISSION_BOOKING_URL}>입학 상담 예약 ↗</a></header>
    <main id="program-content">
      <nav className="program-breadcrumb" aria-label="현재 위치"><a href="/">홈</a><span aria-hidden="true">/</span><span>{guide.label}</span></nav>
      <header className="program-intro"><p className="program-eyebrow">경기 광주 태전동 · 초등·중등 영어</p><h1>{guide.heading}</h1><p className="program-answer">{guide.answer}</p><p className="program-audience">{guide.audience}</p></header>
      <div className="program-body">
        {guide.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(text => <p key={text}>{text}</p>)}</section>)}
        <section className="program-example"><p className="program-eyebrow">학부모 이해를 돕는 예시</p><h2>{guide.example.heading}</h2><p>{guide.example.text}</p><ol>{guide.example.prompts.map(text => <li key={text}>{text}</li>)}</ol></section>
        <section><h2>상담 때 함께 알려주세요</h2><ul>{guide.consultation.map(text => <li key={text}>{text}</li>)}</ul></section>
        <section className="program-faq"><h2>자주 묻는 질문</h2>{guide.faqs.map(({question,answer}) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
        <section className="program-consultation"><h2>아이의 현재 학습 상태부터 상담하세요</h2><p>{CONSULTATION_SUMMARY} 쿠폰 이용 방법은 예약 전에 학원으로 문의해 주세요.</p><div className="program-actions"><a className="program-booking" href={ADMISSION_BOOKING_URL}>입학 상담·레벨테스트 예약 ↗</a><a href={ACADEMY_PHONE_URL}>전화 0507-1356-0671</a></div><p>경기도 광주시 태성로 130-1, 건물 3층 304호 · <a href={ACADEMY_PLACE_URL}>네이버에서 위치 확인</a></p></section>
        <nav className="program-related" aria-label="다른 수업 안내"><h2>다른 수업도 알아보세요</h2>{PROGRAM_GUIDES.filter(other=>other.slug!==guide.slug).map(other=><a key={other.slug} href={'/programs/'+other.slug+'/'}>{other.label} <span aria-hidden="true">↗</span></a>)}<a href="/#admission">전체 입학·방문 안내 <span aria-hidden="true">↗</span></a></nav>
      </div>
    </main>
    <footer className="program-footer"><p>{ACADEMY_NAME} 공식 안내</p><p>학원 운영정보 확인·업데이트 <time dateTime={ACADEMY_CONTENT_UPDATED}>2026년 9월 9일</time></p><a href="https://blog.naver.com/willgrowtj">공식 네이버 블로그 ↗</a></footer>
  </div>;
}
