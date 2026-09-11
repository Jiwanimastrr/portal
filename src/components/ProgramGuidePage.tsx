import { ACADEMY_CONTENT_UPDATED, ACADEMY_NAME, CONSULTATION_SUMMARY } from '../academyContent';
import { ADMISSION_BOOKING_URL, ACADEMY_PHONE_URL } from '../academyLinks';
import { PROGRAM_GUIDES } from '../programContent';
import type { ProgramGuide } from '../programContent';
import { AcademyMapLinks } from './AcademyMapLinks';

export function ProgramGuidePage({ guide }: { guide: ProgramGuide }) {
  return <div className="program-page">
    <a className="program-skip" href="#program-content">본문 바로가기</a>
    <header className="program-header"><a className="program-brand" href="/"><img src="/logo.png" alt="윌그로우어학원 로고" width="44" height="44" /><span>윌그로우어학원<small>태전2국제캠퍼스</small></span></a><a className="program-booking" href={ADMISSION_BOOKING_URL}>입학 상담 예약 ↗</a></header>
    <main id="program-content">
      <nav className="program-breadcrumb" aria-label="현재 위치"><a href="/">홈</a><span aria-hidden="true">/</span><span>{guide.label}</span></nav>
      <header className="program-intro"><p className="program-eyebrow">경기 광주 태전동 · 초등·중등 영어</p><h1>{guide.heading}</h1><p className="program-answer">{guide.answer}</p><p className="program-audience">{guide.audience}</p></header>
      <nav className="program-jump-links" aria-label="과정 안내 바로가기"><a href="#learning-example">집에서 살펴볼 예시</a><a href="#consultation-preparation">상담 준비</a><a href="#program-visit">예약·위치</a></nav>
      <div className="program-body">
        {guide.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(text => <p key={text}>{text}</p>)}</section>)}
        <section id="learning-example" className="program-example" aria-labelledby="learning-example-title">
          <p className="program-eyebrow">집에서 살펴보는 영어 · 상담 준비 예시</p>
          <h2 id="learning-example-title">{guide.example.heading}</h2>
          <p>{guide.example.text}</p>
          <p>아래는 학부모 이해를 돕기 위해 만든 예시입니다. 실제 자체교재 발췌·학생 답안·레벨테스트 문항은 아닙니다.</p>
          <ol className="program-example-steps">{guide.example.steps.map((step, index) => <li key={step.heading}>
            <h3>{step.heading}</h3><p>{step.prompt}</p>
            <details><summary>{index + 1}단계 예시와 설명 보기</summary><div className="program-example-reveal"><p className="program-example-answer">{step.sample}</p><p>{step.explanation}</p></div></details>
          </li>)}</ol>
          <div className="program-observations"><h3>이런 모습은 상담에서 함께 이야기해 주세요</h3><dl>{guide.example.observations.map(({situation,note}) => <div key={situation}><dt>{situation}</dt><dd>{note}</dd></div>)}</dl><p>잘된 부분과 도움을 받은 부분을 함께 알려주세요. 짧은 예시의 수행만으로 아이의 영어 수준이나 적합한 반을 정하지 않습니다.</p></div>
          <div className="program-example-source"><h3>예시 설명에 참고한 자료</h3><a href={guide.example.source.url} target="_blank" rel="noopener noreferrer">{guide.example.source.title} ↗</a><p>{guide.example.source.context}</p><p>자료의 원리를 참고했으며, 해당 기관이 윌그로우를 인증하거나 수업 효과를 평가했다는 뜻은 아닙니다.</p></div>
        </section>
        <section id="consultation-preparation"><h2>상담 때 함께 알려주세요</h2><ul>{guide.consultation.map(text => <li key={text}>{text}</li>)}</ul></section>
        <section className="program-faq"><h2>자주 묻는 질문</h2>{guide.faqs.map(({question,answer}) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
        <section id="program-visit" className="program-consultation"><h2>아이의 현재 학습 상태부터 상담하세요</h2><p>{CONSULTATION_SUMMARY} 네이버 예약 화면에서 알림받기 고객용 무료 레벨테스트 쿠폰과 이용 조건을 확인해 주세요.</p><div className="program-actions"><a className="program-booking" href={ADMISSION_BOOKING_URL}>입학 상담·레벨테스트 예약 ↗</a><a href={ACADEMY_PHONE_URL}>전화 0507-1356-0671</a></div><p>경기도 광주시 태성로 130-1, 건물 3층 304호</p><AcademyMapLinks /></section>
        <nav className="program-related" aria-label="다른 수업 안내"><h2>다른 수업도 알아보세요</h2>{PROGRAM_GUIDES.filter(other=>other.slug!==guide.slug).map(other=><a key={other.slug} href={'/programs/'+other.slug+'/'}>{other.label} <span aria-hidden="true">↗</span></a>)}<a href="/#admission">전체 입학·방문 안내 <span aria-hidden="true">↗</span></a></nav>
      </div>
    </main>
    <footer className="program-footer"><p>{ACADEMY_NAME} 공식 안내</p><p>이 안내의 업데이트 <time dateTime={ACADEMY_CONTENT_UPDATED}>2026년 9월 10일</time></p><a href="https://blog.naver.com/willgrowtj">공식 네이버 블로그 ↗</a></footer>
  </div>;
}
