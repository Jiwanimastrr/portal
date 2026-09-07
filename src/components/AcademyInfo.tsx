export function AcademyInfo() {
  return (
    <section id="admission" className="academy-info" aria-labelledby="academy-title">
      <div className="academy-info-inner">
        <p className="academy-eyebrow">경기 광주 태전동 · 초등·중등 영어</p>
        <h2 id="academy-title">윌그로우어학원 태전2국제캠퍼스</h2>
        <p className="academy-intro">입학 상담과 레벨테스트를 통해 현재 영어 수준을 살펴보고, 아이의 학년과 학습 상태에 맞는 수업과 학습 방향을 안내합니다.</p>
        <p className="academy-name-note">이전에 정철어학원으로 안내되던 태전2캠퍼스의 현재 이름은 윌그로우어학원입니다.</p>

        <div className="academy-facts">
          <div><h3>초등 영어</h3><p>영어의 기초를 다지고 읽기·듣기·말하기·쓰기를 연결하는 학습을 안내합니다.</p></div>
          <div><h3>중등 영어</h3><p>문법과 독해를 바탕으로 학교별 내신과 수행평가를 관리하는 과정을 안내합니다.</p></div>
          <div><h3>방문·문의</h3><p>경기도 광주시 태성로 130-1, 304호<br />건물 3층으로 오시면 됩니다.</p><a href="tel:0507-1356-0671">0507-1356-0671</a></div>
        </div>

        <div className="academy-faq" aria-labelledby="academy-faq-title">
          <h3 id="academy-faq-title">상담 전에 확인하세요</h3>
          <details><summary>처음 방문할 때 어떤 예약을 선택하나요?</summary><p>네이버 플레이스의 예약 메뉴에서 ‘입학 상담 및 레벨테스트’를 선택해 주세요. 선생님 이름이 적힌 보충수업 예약은 재원생용입니다.</p></details>
          <details><summary>상담할 때 무엇을 알려주면 되나요?</summary><p>아이의 학년, 현재 배우는 내용과 어려운 부분, 방문 가능한 시간을 알려주세요. 배정 가능한 반과 수업 시간은 상담에서 확인할 수 있습니다.</p></details>
          <details><summary>상담과 레벨테스트는 얼마나 걸리나요?</summary><p>진단과 상담에 필요한 시간은 예약 전에 학원으로 문의해 주세요.</p></details>
        </div>

        <div className="academy-actions">
          <a className="btn btn-primary" href="https://map.naver.com/p/entry/place/1694768560" target="_blank" rel="noopener noreferrer">네이버에서 위치·예약 확인 ↗</a>
          <a className="academy-guide-link" href="https://blog.naver.com/willgrowtj/224403803666" target="_blank" rel="noopener noreferrer">입학 상담 자세히 보기 ↗</a>
        </div>
        <p className="academy-legal-name">등록 학원명: 윌그로우태전2국제캠퍼스어학원</p>
      </div>
    </section>
  )
}
