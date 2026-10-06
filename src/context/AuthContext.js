import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  activateGuestLocalUser,
  clearActiveLocalUser,
  getDatabase,
  getLocalAccountStatus,
  linkLocalUserToAuthAccount,
} from '../services/database';
import {
  getAuthErrorMessage,
  initializeAuth,
  isAuthConfigured,
  onAuthStateChanged,
  signIn as providerSignIn,
  signOut as providerSignOut,
  signUp as providerSignUp,
} from '../services/authService';

const AuthContext = createContext(null);

function publicUser(authUser, localUser) {
  return {
    uid: authUser.uid,
    email: authUser.email,
    displayName: localUser.display_name || authUser.displayName || '',
    localUserId: localUser.id,
  };
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [pendingLink, setPendingLink] = useState(null);
  const [error, setError] = useState(null);
  const authUserRef = useRef(null);
  const resolvingUidRef = useRef(null);

  const resolveProviderUser = useCallback(async (authUser) => {
    if (!authUser) {
      authUserRef.current = null;
      resolvingUidRef.current = null;
      clearActiveLocalUser();
      setUser(null);
      setPendingLink(null);
      try {
        await activateGuestLocalUser();
        setError(null);
        setStatus('guest');
        setAuthReady(true);
        return 'guest';
      } catch (guestError) {
        setError(getAuthErrorMessage(guestError));
        setStatus('guest');
        setAuthReady(true);
        return 'guest';
      }
      return;
    }

    if (resolvingUidRef.current === authUser.uid) return;
    authUserRef.current = authUser;
    resolvingUidRef.current = authUser.uid;
    setStatus('resolving');
    setError(null);

    try {
      const localStatus = await getLocalAccountStatus(authUser);
      if (authUserRef.current?.uid !== authUser.uid) return;
      if (localStatus.linked) {
        const localUser = await linkLocalUserToAuthAccount(authUser);
        if (authUserRef.current?.uid !== authUser.uid) return;
        setUser(publicUser(authUser, localUser));
        resolvingUidRef.current = null;
        setStatus('authenticated');
        setAuthReady(true);
        return 'authenticated';
      } else if (localStatus.legacyScanCount > 0) {
        setPendingLink({
          authUser,
          legacyScanCount: localStatus.legacyScanCount,
        });
        setStatus('linking');
        setAuthReady(true);
        return 'linking';
      } else {
        const localUser = await linkLocalUserToAuthAccount(authUser);
        if (authUserRef.current?.uid !== authUser.uid) return;
        setUser(publicUser(authUser, localUser));
        resolvingUidRef.current = null;
        setStatus('authenticated');
        setAuthReady(true);
        return 'authenticated';
      }
    } catch (resolutionError) {
      resolvingUidRef.current = null;
      setError(getAuthErrorMessage(resolutionError));
      clearActiveLocalUser();
      await activateGuestLocalUser();
      setStatus('guest');
      setAuthReady(true);
      return 'guest';
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    async function initialize() {
      try {
        await getDatabase();
        await activateGuestLocalUser();
        if (!isAuthConfigured()) {
          if (isMounted) {
            setStatus('guest');
            setAuthReady(true);
          }
          return;
        }
        const auth = initializeAuth();
        await auth.authStateReady();
        if (!isMounted) return;
        unsubscribe = onAuthStateChanged((authUser) => {
          if (isMounted) void resolveProviderUser(authUser);
        });
      } catch (initializationError) {
        if (isMounted) {
          setError(getAuthErrorMessage(initializationError));
          setStatus('guest');
          setAuthReady(true);
        }
      }
    }

    void initialize();
    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [resolveProviderUser]);

  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      const authUser = await providerSignIn(email, password);
      return await resolveProviderUser(authUser);
    } catch (signInError) {
      throw new Error(getAuthErrorMessage(signInError));
    }
  }, [resolveProviderUser]);

  const signUp = useCallback(async (email, password, displayName) => {
    setError(null);
    try {
      const authUser = await providerSignUp(email, password, displayName);
      return await resolveProviderUser(authUser);
    } catch (signUpError) {
      throw new Error(getAuthErrorMessage(signUpError));
    }
  }, [resolveProviderUser]);

  const finishLocalLink = useCallback(async (importLegacyData) => {
    if (!pendingLink) return;
    setStatus('resolving');
    setError(null);
    try {
      const localUser = await linkLocalUserToAuthAccount(
        pendingLink.authUser,
        importLegacyData,
      );
      setUser(publicUser(pendingLink.authUser, localUser));
      setPendingLink(null);
      resolvingUidRef.current = null;
      setStatus('authenticated');
      setAuthReady(true);
    } catch (linkError) {
      setError(getAuthErrorMessage(linkError));
      setStatus('linking');
    }
  }, [pendingLink]);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await providerSignOut();
      clearActiveLocalUser();
      resolvingUidRef.current = null;
      authUserRef.current = null;
      await activateGuestLocalUser();
      setUser(null);
      setPendingLink(null);
      setStatus('guest');
      setAuthReady(true);
    } catch (signOutError) {
      setError(getAuthErrorMessage(signOutError));
      throw new Error(getAuthErrorMessage(signOutError));
    }
  }, []);

  const continueAsGuest = useCallback(async () => {
    if (pendingLink) {
      await providerSignOut();
      clearActiveLocalUser();
      authUserRef.current = null;
      resolvingUidRef.current = null;
      await activateGuestLocalUser();
      setUser(null);
      setPendingLink(null);
      setStatus('guest');
    }
    setError(null);
  }, [pendingLink]);

  const value = useMemo(() => ({
    status,
    authReady,
    user,
    pendingLink,
    error,
    signIn,
    signUp,
    signOut,
    continueAsGuest,
    finishLocalLink,
  }), [
    status,
    authReady,
    user,
    pendingLink,
    error,
    signIn,
    signUp,
    signOut,
    continueAsGuest,
    finishLocalLink,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
