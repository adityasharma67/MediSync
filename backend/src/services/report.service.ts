import MedicalReport from '../models/medicalReport.model';

class ReportService {
  private async extractText(input: { fileData?: string; ocrText?: string; mimeType: string }) {
    if (input.ocrText?.trim()) {
      return input.ocrText.trim();
    }

    if (input.mimeType.startsWith('text/') && input.fileData) {
      return Buffer.from(input.fileData, 'base64').toString('utf8');
    }

    return 'OCR extraction placeholder: provide ocrText from the client or integrate a Tesseract worker for binary PDF/image parsing.';
  }

  private async explainInSimpleLanguage(text: string) {
    if (!process.env.OPENAI_API_KEY) {
      return {
        summary: 'OpenAI API key not configured. Report text was extracted and stored, but AI explanation is running in fallback mode.',
        insights: [
          'Review the extracted text with a doctor for clinical interpretation.',
          'Configure OPENAI_API_KEY to enable simple-language explanations.',
        ],
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MEDICAL_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You explain medical reports in simple language, include important cautions, and avoid making a diagnosis.',
          },
          {
            role: 'user',
            content: `Explain this report in simple language and return JSON with keys summary and insights: ${text.slice(0, 10000)}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    return {
      summary: parsed.summary || 'Medical report processed.',
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
    };
  }

  async analyze(payload: {
    patientId: string;
    title: string;
    fileName: string;
    mimeType: string;
    fileData?: string;
    appointmentId?: string;
    ocrText?: string;
  }) {
    const extractedText = await this.extractText(payload);
    const explanation = await this.explainInSimpleLanguage(extractedText);

    return MedicalReport.create({
      patient: payload.patientId,
      appointment: payload.appointmentId,
      title: payload.title,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      fileData: payload.fileData,
      extractedText,
      plainLanguageSummary: explanation.summary,
      insights: explanation.insights,
      sourceType: payload.mimeType.includes('pdf')
        ? 'pdf'
        : payload.mimeType.startsWith('image/')
          ? 'image'
          : 'text',
    });
  }
}

export default new ReportService();
