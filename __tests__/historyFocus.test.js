import { subscribeToHistoryFocus } from '../src/services/historyNavigation';

describe('history navigation refresh', () => {
  it('reloads history every time the History route receives focus', () => {
    let onFocus;
    const refresh = jest.fn();
    const unsubscribe = jest.fn();
    const navigation = {
      addListener: jest.fn((event, listener) => {
        expect(event).toBe('focus');
        onFocus = listener;
        return unsubscribe;
      }),
    };
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    expect(subscribeToHistoryFocus(navigation, refresh)).toBe(unsubscribe);
    onFocus();

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[PlantCare][History] SCREEN FOCUSED');
    log.mockRestore();
  });
});
