export interface TranslationRequest {
  text: string;
  sourceLanguage?: string; // Optional: auto-detect if omitted
  targetLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
}

export interface ITranslationProvider {
  readonly name: string;
  translate(request: TranslationRequest): Promise<TranslationResponse>;
}
