import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  (async () => {
    const CookieConsent = await import('vanilla-cookieconsent');
    await import('vanilla-cookieconsent/dist/cookieconsent.css');

    const updateGtag = (analyticsGranted) => {
      window.dataLayer = window.dataLayer || [];
      const gtag = (...args) => window.dataLayer.push(args);
      gtag('consent', 'update', {
        analytics_storage: analyticsGranted ? 'granted' : 'denied',
      });
    };

    CookieConsent.run({
      guiOptions: {
        consentModal: { layout: 'box', position: 'bottom right' },
        preferencesModal: { layout: 'box' },
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {},
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'Cookie Consent',
              description:
                'We use cookies to analyze site traffic and improve your experience.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage preferences',
            },
            preferencesModal: {
              title: 'Cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Strictly necessary',
                  description:
                    'These cookies are essential for the site to function and cannot be disabled.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytics',
                  description:
                    'Help us understand how visitors use the site so we can improve it.',
                  linkedCategory: 'analytics',
                },
              ],
            },
          },
        },
      },
      onFirstConsent: () => updateGtag(CookieConsent.acceptedCategory('analytics')),
      onChange: () => updateGtag(CookieConsent.acceptedCategory('analytics')),
      onConsent: () => updateGtag(CookieConsent.acceptedCategory('analytics')),
    });
  })();
}
