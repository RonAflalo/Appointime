interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

interface LLMResponse {
  response: string;
}

interface UploadResponse {
  url: string;
}

interface ImageResponse {
  url: string;
}

interface DataExtractionResponse {
  data: Record<string, unknown>;
}

// Mock integrations
const mockCore = {
  InvokeLLM: async (): Promise<LLMResponse> => ({ response: "Mock response" }),
  SendEmail: async (options: EmailOptions): Promise<void> => {
    console.log('Sending email:', options);
  },
  UploadFile: async (): Promise<UploadResponse> => ({ url: "mock-url" }),
  GenerateImage: async (): Promise<ImageResponse> => ({ url: "mock-image-url" }),
  ExtractDataFromUploadedFile: async (): Promise<DataExtractionResponse> => ({ data: {} })
};

export const Core = {
  ...mockCore
};

export const InvokeLLM = mockCore.InvokeLLM;
export const SendEmail = mockCore.SendEmail;
export const UploadFile = mockCore.UploadFile;
export const GenerateImage = mockCore.GenerateImage;
export const ExtractDataFromUploadedFile = mockCore.ExtractDataFromUploadedFile; 