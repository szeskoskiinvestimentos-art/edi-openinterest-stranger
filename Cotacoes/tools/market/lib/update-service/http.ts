export function serviceBaseUrl(params: { host: string; port: number }) {
  return `http://${params.host}:${params.port}`
}

