import dayjs from 'dayjs';

import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/nl';
import 'dayjs/locale/pt';
import 'dayjs/locale/pt-br';

const APP_TO_DAYJS: Record<string, string> = {
  en: 'en',
  pt: 'pt-br',
  'pt-pt': 'pt',
  'es-es': 'es',
  'nl-nl': 'nl',
  'de-de': 'de',
  'fr-fr': 'fr',
};

export function appLanguageToDayjsLocale(language: string | undefined): string {
  if (!language) {
    return 'en';
  }
  return APP_TO_DAYJS[language] ?? APP_TO_DAYJS[language.toLowerCase()] ?? 'en';
}

export function applyDayjsLocale(language: string | undefined): void {
  dayjs.locale(appLanguageToDayjsLocale(language));
}
