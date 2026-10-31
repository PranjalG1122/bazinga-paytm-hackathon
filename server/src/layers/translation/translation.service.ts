import {
  ITranslationProvider,
  TranslationRequest,
  TranslationResponse,
  UnderstoodMessage,
} from './translation.types.js';
import { SarvamTranslationProvider } from './providers/sarvam.provider.js';

/** Our base language. All reply logic works in this language. */
export const BASE_LANGUAGE = 'en-IN';

/**
 * Stateless translation layer. Stores nothing about users; the caller
 * decides which language to use.
 */
export class TranslationService {
  private provider: ITranslationProvider;

  constructor(provider?: ITranslationProvider) {
    this.provider = provider || new SarvamTranslationProvider();
  }

  /**
   * Sets or overrides the active translation provider at runtime.
   */
  setProvider(provider: ITranslationProvider): void {
    this.provider = provider;
  }

  /**
   * Translates text from source language to target language.
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    if (!request.text || request.text.trim() === '') {
      return {
        translatedText: '',
        sourceLanguage: request.sourceLanguage || 'unknown',
        targetLanguage: request.targetLanguage,
        provider: this.provider.name,
      };
    }
    return await this.provider.translate(request);
  }

  /**
   * Merchant text in any language -> English. The provider detects the source language
   * unless a source language is given.
   */
  async understand(text: string, sourceLanguage = 'auto'): Promise<UnderstoodMessage> {
    if (sourceLanguage === BASE_LANGUAGE) return { language: BASE_LANGUAGE, text };
    const result = await this.translate({
      text,
      sourceLanguage,
      targetLanguage: BASE_LANGUAGE,
    });
    return { language: result.sourceLanguage, text: result.translatedText };
  }

  /**
   * English -> the given language. Returns the text unchanged for the base language.
   */
  async localize(text: string, language: string): Promise<string> {
    if (language === BASE_LANGUAGE) return text;
    const result = await this.translate({
      text,
      sourceLanguage: BASE_LANGUAGE,
      targetLanguage: language,
    });
    return result.translatedText;
  }
}

export const translationService = new TranslationService();
