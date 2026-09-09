import { ACADEMY_CONTENT_UPDATED, ACADEMY_FAQS, ACADEMY_LEGAL_NAME, ACADEMY_NAME, ACADEMY_SITE_URL } from './academyContent';
import { ACADEMY_PHONE_URL, ACADEMY_PLACE_URL } from './academyLinks';

export function academyStructuredData() {
  const organizationId = `${ACADEMY_SITE_URL}#taejeon2`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': organizationId,
        name: ACADEMY_NAME,
        legalName: ACADEMY_LEGAL_NAME,
        url: ACADEMY_SITE_URL,
        logo: `${ACADEMY_SITE_URL}logo.png`,
        description: '경기도 광주시 태전동의 초·중등 영어학원. 이전에 정철어학원으로 안내되던 태전2캠퍼스의 현재 이름은 윌그로우어학원입니다.',
        telephone: ACADEMY_PHONE_URL.replace('tel:', ''),
        address: {
          '@type': 'PostalAddress',
          streetAddress: '태성로 130-1, 304호',
          addressLocality: '광주시',
          addressRegion: '경기도',
          addressCountry: 'KR',
        },
        sameAs: [ACADEMY_PLACE_URL, 'https://blog.naver.com/willgrowtj', 'https://www.instagram.com/willgrow.official.tj'],
      },
      {
        '@type': 'WebSite',
        '@id': `${ACADEMY_SITE_URL}#website`,
        url: ACADEMY_SITE_URL,
        name: ACADEMY_NAME,
        inLanguage: 'ko-KR',
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'WebPage',
        '@id': `${ACADEMY_SITE_URL}#webpage`,
        url: ACADEMY_SITE_URL,
        name: `${ACADEMY_NAME} | 경기 광주 초·중등 영어`,
        inLanguage: 'ko-KR',
        dateModified: ACADEMY_CONTENT_UPDATED,
        about: { '@id': organizationId },
        publisher: { '@id': organizationId },
        isPartOf: { '@id': `${ACADEMY_SITE_URL}#website` },
        hasPart: { '@id': `${ACADEMY_SITE_URL}#academy-faq` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${ACADEMY_SITE_URL}#academy-faq`,
        isPartOf: { '@id': `${ACADEMY_SITE_URL}#webpage` },
        about: { '@id': organizationId },
        inLanguage: 'ko-KR',
        mainEntity: ACADEMY_FAQS.map(({ id, question, answer }) => ({
          '@type': 'Question',
          '@id': `${ACADEMY_SITE_URL}#${id}`,
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };
}
