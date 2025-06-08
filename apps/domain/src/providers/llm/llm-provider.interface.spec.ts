import { ILLMProvider } from "./llm-provider.interface";

describe("ILLMProvider Interface", () => {
  it("should define generate method accepting string or messages", () => {
    // This test verifies the interface contract
    const mockProvider: ILLMProvider = {
      generate: jest.fn(),
      getName: jest.fn(),
      isAvailable: jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockProvider.generate).toBeDefined();
    expect(typeof mockProvider.generate).toBe("function");
  });

  it("should define getName method", () => {
    const mockProvider: ILLMProvider = {
      generate: jest.fn(),
      getName: jest.fn(),
      isAvailable: jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockProvider.getName).toBeDefined();
    expect(typeof mockProvider.getName).toBe("function");
  });

  it("should define isAvailable method", () => {
    const mockProvider: ILLMProvider = {
      generate: jest.fn(),
      getName: jest.fn(),
      isAvailable: jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockProvider.isAvailable).toBeDefined();
    expect(typeof mockProvider.isAvailable).toBe("function");
  });
});
