export type TBasicError = {
  message: string;
  statusCode: number;
} | null;

export type TCallback = (error: any, reponse: any) => void;
