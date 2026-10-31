import { ITranslationProvider, TranslationRequest, TranslationResponse } from './translation.types.js';
import { PlaceholderTranslationProvider } from './providers/placeholder.provider.js';

export class TranslationService {
  private provider: ITranslationProvider;

  constructor(provider?: ITranslationProvider) {
    this.provider = provider || new PlaceholderTranslationProvider();
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
}

export const translationService = new TranslationService();
