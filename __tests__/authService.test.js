jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('firebase/app', () => ({
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({ name: '[DEFAULT]' })),
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(),
  getReactNativePersistence: jest.fn((storage) => storage),
  initializeAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));

const FIREBASE_ENV_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];
const ORIGINAL_FIREBASE_ENV = Object.fromEntries(
  FIREBASE_ENV_KEYS.map((key) => [key, process.env[key]]),
);

describe('Firebase auth service', () => {
  let authService;
  let authSdk;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    for (const key of FIREBASE_ENV_KEYS) process.env[key] = `test-${key}`;
    authService = require('../src/services/authService');
    authSdk = require('firebase/auth');
  });

  afterAll(() => {
    for (const key of FIREBASE_ENV_KEYS) {
      if (ORIGINAL_FIREBASE_ENV[key] === undefined) delete process.env[key];
      else process.env[key] = ORIGINAL_FIREBASE_ENV[key];
    }
  });

  it('requires Firebase project configuration instead of using fake credentials', () => {
    delete process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    jest.resetModules();
    authService = require('../src/services/authService');

    expect(authService.isAuthConfigured()).toBe(false);
    expect(() => authService.initializeAuth()).toThrow(
      'Firebase Authentication is not configured for this build.',
    );
  });

  it('initializes Firebase Auth with AsyncStorage-backed persistence', async () => {
    const expectedAuth = { currentUser: null };
    authSdk.initializeAuth.mockReturnValue(expectedAuth);
    const asyncStorage = require('@react-native-async-storage/async-storage').default;
    asyncStorage.getItem.mockResolvedValue('persisted-session');

    expect(authService.initializeAuth()).toBe(expectedAuth);
    expect(authSdk.getReactNativePersistence).toHaveBeenCalledWith(asyncStorage);
    expect(authSdk.initializeAuth.mock.calls[0][1].persistence).toBe(asyncStorage);
    expect(asyncStorage.getItem).toHaveBeenCalledTimes(0);
  });

  it('sanitizes common credential and connectivity failures', () => {
    expect(authService.getAuthErrorMessage({ code: 'auth/invalid-credential' }))
      .toBe('Email or password is incorrect.');
    expect(authService.getAuthErrorMessage({ code: 'auth/network-request-failed' }))
      .toContain('internet connection');
    expect(authService.getAuthErrorMessage({ code: 'auth/email-already-in-use' }))
      .toContain('Try logging in instead.');
    expect(authService.getAuthErrorMessage({ code: 'auth/user-not-found' }))
      .toBe('No account was found with this email.');
  });

  it('maps Firebase internal errors to actionable guidance', () => {
    expect(authService.getAuthErrorMessage({ code: 'auth/internal-error' }))
      .toContain('could not initialize');
  });

  it('logs unknown Firebase code and a redacted message without credentials', () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(authService.getAuthErrorMessage({
      code: 'auth/new-provider-error',
      message: 'Rejected token=secret-token and api_key=secret-api-key',
    })).toBe('Firebase could not complete this request. Please try again.');
    expect(errorLog).toHaveBeenCalledWith('[PlantCare][Auth] Firebase error details:', {
      code: 'auth/new-provider-error',
      message: 'Rejected token=[REDACTED] and api_key=[REDACTED]',
    });
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain('secret-token');
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain('secret-api-key');
    errorLog.mockRestore();
  });
});
