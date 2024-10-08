export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

console.log('isAuthenticated', isAuthenticated);

export const getMenuItems = (isAuthenticated, handleSignIn, handleSignOut) => [
    {title: 'Profile', url: 'profile', key: 1, isShow: isAuthenticated},
    {title: 'My Gif library', url: 'gif-library', key: 2, isShow: isAuthenticated},
    {title: 'Insights & Inspiration', url: 'insights', key: 3, isShow: !isAuthenticated},
    {title: 'What is Gif-t?', url: 'https://gif-t.io/what-is-gift', isExternal: true, key: 4, isShow: true},
    {title: 'Sign in', url: '', key: 5, isShow: !isAuthenticated, onClick: handleSignIn},
    {title: 'Sign out', url: '', key: 6, isShow: isAuthenticated, onClick: handleSignOut},
]

export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function isValidEmail(email) {
  return emailRegex.test(email);
}