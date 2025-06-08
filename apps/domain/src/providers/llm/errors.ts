export class ProviderNotFoundError extends Error {
  constructor(providerName: string) {
    super(`Provider '${providerName}' not found`);
    this.name = "ProviderNotFoundError";
  }
}
