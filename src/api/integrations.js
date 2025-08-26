// Import mock integrations instead of Base44
import { 
  Core,
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile
} from './mockServices';

// Re-export for backward compatibility
export { 
  Core,
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile
};






