export function subscribeToHistoryFocus(navigation, refresh) {
  return navigation.addListener('focus', () => {
    console.log('[PlantCare][History] SCREEN FOCUSED');
    refresh();
  });
}
