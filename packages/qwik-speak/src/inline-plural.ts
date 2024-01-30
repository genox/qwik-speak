import { getValue, separateKeyValue } from './core';
import { getLang, getSpeakContext } from './context';

export type InlinePluralFn = {
  /**
   * Get the plural by a number.
   * The value is passed as a parameter to the translate function
   * @param value A number or a string
   * @param key Optional key   
   * @param params Optional parameters contained in the values
   * @param options Intl PluralRulesOptions object
   * @param lang Optional language if different from the current one
   * @returns The translation for the plural
   */
  (
    value: number | string,
    key?: string,
    params?: Record<string, any>,
    options?: Intl.PluralRulesOptions,
    lang?: string
  ): string;
};

export const inlinePlural = (): InlinePluralFn => {
  const currentLang = getLang();

  const plural = (
    value: number | string,
    key?: string,
    params?: Record<string, any>,
    options?: Intl.PluralRulesOptions,
    lang?: string
  ) => {
    const { translation, config } = getSpeakContext();

    lang ??= currentLang;
    value = +value;

    const rule = new Intl.PluralRules(lang, options).select(value);

    let defaultValues: string | undefined = undefined;
    if (key) {
      [key, defaultValues] = separateKeyValue(key, config.keyValueSeparator);

      if (!defaultValues && /^{.*}$/.test(key)) {
        defaultValues = key;
        key = undefined;
      }
    }

    key = key ? `${key}${config.keySeparator}${rule}` : rule;

    const defaultValue = defaultValues ? JSON.parse(defaultValues)[rule] : undefined;
    if (defaultValue) key = `${key}${config.keyValueSeparator}${defaultValue}`;

    return getValue(key, translation[lang], { value, ...params }, config.keySeparator, config.keyValueSeparator);
  };

  return plural as InlinePluralFn;
};
