export interface NebiusImageGenerationRequest {
  model: string;
  prompt: string;
  response_format: "url";
  width: number;
  height: number;
  num_inference_steps: number;
  n?: number;
}
