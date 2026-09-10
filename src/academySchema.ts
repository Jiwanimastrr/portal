import { ACADEMY_CONTENT_UPDATED, ACADEMY_FAQS, ACADEMY_LEARNING_SUMMARY, ACADEMY_LEGAL_NAME, ACADEMY_NAME, ACADEMY_SITE_URL } from './academyContent';
import { ACADEMY_PHONE_URL, ACADEMY_PLACE_URL, ACADEMY_KAKAO_MAP_URL, ACADEMY_GOOGLE_MAP_URL } from './academyLinks';
import type { ProgramGuide } from './programContent';

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
        description: ACADEMY_LEARNING_SUMMARY,
        telephone: ACADEMY_PHONE_URL.replace('tel:', ''),
        address: {
          '@type': 'PostalAddress',
          streetAddress: '태성로 130-1, 304호',
          addressLocality: '광주시',
          addressRegion: '경기도',
          addressCountry: 'KR',
        },
        sameAs: [ACADEMY_PLACE_URL, ACADEMY_KAKAO_MAP_URL, ACADEMY_GOOGLE_MAP_URL, 'https://blog.naver.com/willgrowtj', 'https://www.instagram.com/willgrow.official.tj'],
      },
      {
        '@type': 'WebSite',
        '@id': `${ACADEMY_SITE_URL}#website`,
        url: ACADEMY_SITE_URL,
        name: ACADEMY_NAME,
        alternateName: ['윌그로우 태전2', 'willgrow.pages.dev'],
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

export function programStructuredData(guide: ProgramGuide) {
  const url = ACADEMY_SITE_URL + 'programs/' + guide.slug + '/';
  const organizationId = ACADEMY_SITE_URL + '#taejeon2';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...academyStructuredData()['@graph'].filter(node => node['@type'] === 'EducationalOrganization' || node['@type'] === 'WebSite'),
      { '@type': 'WebPage', '@id': url + '#webpage', url, name: guide.title, description: guide.description, inLanguage: 'ko-KR', dateModified: ACADEMY_CONTENT_UPDATED, about: { '@id': organizationId }, publisher: { '@id': organizationId }, isPartOf: { '@id': ACADEMY_SITE_URL + '#website' }, breadcrumb: { '@id': url + '#breadcrumb' }, hasPart: { '@id': url + '#faq' } },
      { '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: [{ '@type': 'ListItem', position: 1, name: ACADEMY_NAME, item: ACADEMY_SITE_URL }, { '@type': 'ListItem', position: 2, name: guide.label, item: url }] },
      { '@type': 'FAQPage', '@id': url + '#faq', isPartOf: { '@id': url + '#webpage' }, inLanguage: 'ko-KR', mainEntity: guide.faqs.map(({question,answer})=>({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
    ],
  };
}
