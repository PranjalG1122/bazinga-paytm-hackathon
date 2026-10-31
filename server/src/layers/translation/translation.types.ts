export interface TranslationRequest {
  text: string;
  sourceLanguage?: string; // Optional: auto-detect if omitted
  targetLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string; // For auto-detect, the language the provider detected
  targetLanguage: string;
  provider: string;
}

export interface ITranslationProvider {
  readonly name: string;
  translate(request: TranslationRequest): Promise<TranslationResponse>;
}

/** Result of translating merchant text into our base language. */
export interface UnderstoodMessage {
  language: string; // Detected language code, e.g. hi-IN
  text: string; // English meaning
}

/** Error from an upstream translation provider, carrying its HTTP status and body. */
export class TranslationProviderError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = 'TranslationProviderError';
  }
}
