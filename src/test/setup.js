import "@testing-library/jest-dom/vitest";

// Mock localStorage
const store = {};
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, value) => { store[key] = String(value); }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Reset between tests
beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
});

// Mock import.meta.env
vi.stubGlobal("import", { meta: { env: { VITE_ANTHROPIC_KEY: "test-key" } } });

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() { this.observe = vi.fn(); this.unobserve = vi.fn(); this.disconnect = vi.fn(); }
}
window.IntersectionObserver = MockIntersectionObserver;
