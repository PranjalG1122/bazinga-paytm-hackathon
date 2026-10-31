import { config, assertEnv } from '../../../config/env.js';
import {
  ITranslationProvider,
  TranslationRequest,
  TranslationResponse,
  TranslationProviderError,
} from '../translation.types.js';

const SARVAM_TRANSLATE_URL = 'https://api.sarvam.ai/translate';

interface SarvamTranslateResponse {
  translated_text: string;
  source_language_code: string;
  request_id: string;
}

/**
 * Sarvam AI translation provider.
 * Docs: POST https://api.sarvam.ai/translate with header `api-subscription-key`.
 */
export class SarvamTranslationProvider implements ITranslationProvider {
  readonly name = 'sarvam';

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const apiKey = assertEnv(config.translation.sarvamApiKey, 'SARVAM_API_KEY');
    const sourceLanguage = request.sourceLanguage || 'auto';

    const response = await fetch(SARVAM_TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        input: request.text,
        source_language_code: sourceLanguage,
        target_language_code: request.targetLanguage,
      }),
    });

    const raw = await response.text();
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      body = raw;
    }

    if (!response.ok) {
      throw new TranslationProviderError(
        `Sarvam translate failed with HTTP ${response.status}`,
        response.status,
        body
      );
    }

    const result = body as SarvamTranslateResponse;
    return {
      translatedText: result.translated_text,
      sourceLanguage: result.source_language_code,
      targetLanguage: request.targetLanguage,
      provider: this.name,
    };
  }
}
