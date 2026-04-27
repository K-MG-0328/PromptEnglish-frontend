function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`필수 환경 변수가 누락되었습니다: ${name}`);
  }
  return value;
}

function validateEnv(): void {
  requireEnv("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL);
}

export const env = {
  get apiBaseUrl(): string {
    return requireEnv("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL);
  },

  validate: validateEnv,
};
