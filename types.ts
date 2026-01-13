
export enum ConversionStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  status: ConversionStatus;
  convertedBlob?: Blob;
  error?: string;
}
