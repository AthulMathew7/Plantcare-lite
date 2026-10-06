let mockAuthConfigured = false;

jest.mock('../src/services/database', () => ({
  activateGuestLocalUser: jest.fn().mockResolvedValue(1),
  clearActiveLocalUser: jest.fn(),
  getDatabase: jest.fn().mockResolvedValue({}),
  getLocalAccountStatus: jest.fn().mockResolvedValue({
    linked: false,
    legacyScanCount: 0,
  }),
  linkLocalUserToAuthAccount: jest.fn(async (authUser) => ({
    id: 2,
    display_name: authUser.displayName || 'PlantCare user',
    email: authUser.email,
  })),
}));

jest.mock('../src/services/authService', () => ({
  getAuthErrorMessage: jest.fn((error) => error.message || 'Auth error'),
  initializeAuth: jest.fn(() => ({ authStateReady: jest.fn().mockResolvedValue(undefined) })),
  isAuthConfigured: jest.fn(() => mockAuthConfigured),
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn();
  }),
  signIn: jest.fn(),
  signOut: jest.fn().mockResolvedValue(undefined),
  signUp: jest.fn(),
}));

describe('optional authentication state', () => {
  let AuthProvider;
  let useAuth;
  let database;
  let authService;
  let contextValue;
  let renderer;
  let React;
  let TestRenderer;

  function ContextConsumer() {
    contextValue = useAuth();
    return null;
  }

  async function mountProvider() {
    await React.act(async () => {
      renderer = TestRenderer.create(
        <AuthProvider>
          <ContextConsumer />
        </AuthProvider>,
      );
    });
  }

  beforeEach(() => {
    jest.resetModules();
    mockAuthConfigured = false;
    React = require('react');
    TestRenderer = require('react-test-renderer');
    ({ AuthProvider, useAuth } = require('../src/context/AuthContext'));
    database = require('../src/services/database');
    authService = require('../src/services/authService');
  });

  afterEach(() => {
    if (renderer) React.act(() => renderer.unmount());
    renderer = null;
  });

  it('activates a local guest profile without initializing Firebase', async () => {
    await mountProvider();

    expect(contextValue.status).toBe('guest');
    expect(contextValue.user).toBeNull();
    expect(database.activateGuestLocalUser).toHaveBeenCalled();
    expect(authService.initializeAuth).not.toHaveBeenCalled();
  });

  it('resolves successful login to authenticated state', async () => {
    mockAuthConfigured = true;
    authService.signIn.mockResolvedValue({
      uid: 'firebase-user',
      email: 'farmer@example.com',
      displayName: 'Farmer',
    });
    await mountProvider();

    await React.act(async () => {
      await contextValue.signIn('farmer@example.com', 'password');
    });

    expect(contextValue.status).toBe('authenticated');
    expect(contextValue.user).toMatchObject({
      uid: 'firebase-user',
      email: 'farmer@example.com',
      localUserId: 2,
    });
  });

  it('resolves successful signup to authenticated state without restarting', async () => {
    mockAuthConfigured = true;
    authService.signUp.mockResolvedValue({
      uid: 'new-firebase-user',
      email: 'new@example.com',
      displayName: 'New User',
    });
    await mountProvider();

    await React.act(async () => {
      await contextValue.signUp('new@example.com', 'securepassword', 'New User');
    });

    expect(contextValue.status).toBe('authenticated');
    expect(contextValue.user.displayName).toBe('New User');
  });

  it('returns to guest mode on logout while retaining guest profile', async () => {
    mockAuthConfigured = true;
    authService.signIn.mockResolvedValue({
      uid: 'firebase-user',
      email: 'farmer@example.com',
      displayName: 'Farmer',
    });
    await mountProvider();
    await React.act(async () => {
      await contextValue.signIn('farmer@example.com', 'password');
    });

    await React.act(async () => {
      await contextValue.signOut();
    });

    expect(contextValue.status).toBe('guest');
    expect(contextValue.user).toBeNull();
    expect(authService.signOut).toHaveBeenCalled();
    expect(database.activateGuestLocalUser).toHaveBeenCalled();
  });
});
