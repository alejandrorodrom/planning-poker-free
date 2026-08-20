import type { Messages } from '$lib/i18n/types';

export type FaqItem = { question: string; answer: string };

export function landingFaqItems(landing: Messages['landing']): FaqItem[] {
  return [
    { question: landing.faq1Q, answer: landing.faq1A },
    { question: landing.faq2Q, answer: landing.faq2A },
    { question: landing.faq3Q, answer: landing.faq3A },
    { question: landing.faq4Q, answer: landing.faq4A },
    { question: landing.faq5Q, answer: landing.faq5A }
  ];
}

export function faqPageJsonLd(items: FaqItem[], pageUrl: string): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    })),
    url: pageUrl
  });
}

export function howToJsonLd(
  landing: Messages['landing'],
  pageUrl: string
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: landing.howItWorksTitle,
    description: landing.howItWorksDescription,
    url: pageUrl,
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: landing.howStep1Title,
        text: landing.howStep1Body
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: landing.howStep2Title,
        text: landing.howStep2Body
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: landing.howStep3Title,
        text: landing.howStep3Body
      }
    ]
  });
}

export function jsonLdScriptTag(json: string): string {
  return `<script type="application/ld+json">${json.replace(/</g, '\\u003c')}</script>`;
}

export function landingJsonLdHtml(
  landing: Messages['landing'],
  pageUrl: string
): string {
  return (
    jsonLdScriptTag(faqPageJsonLd(landingFaqItems(landing), pageUrl)) +
    jsonLdScriptTag(howToJsonLd(landing, pageUrl))
  );
}
