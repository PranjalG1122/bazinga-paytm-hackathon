import { ITranslationProvider, TranslationRequest, TranslationResponse } from '../translation.types.js';

/**
 * Placeholder translation provider.
 * TODO: Implement real translation vendor (e.g., Google Cloud Translate, Azure Translator, LibreTranslate, or LLM-based translation).
 */
export class PlaceholderTranslationProvider implements ITranslationProvider {
  readonly name = 'placeholder-translator';

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    // In placeholder mode, echo text annotated with target language
    return {
      translatedText: `[Translated (${request.targetLanguage})]: ${request.text}`,
      sourceLanguage: request.sourceLanguage || 'auto',
      targetLanguage: request.targetLanguage,
      provider: this.name,
    };
  }
}
