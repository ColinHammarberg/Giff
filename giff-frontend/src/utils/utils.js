const isAuthenticated = localStorage.getItem('access_token');

console.log('isAuthenticated', isAuthenticated);

export const MenuItems = [
    {title: 'Profile', url: 'profile', key: 1, isShow: isAuthenticated},
    {title: 'My Gif library', url: 'library', key: 2, isShow: isAuthenticated},
    {title: 'Signin', url: '', key: 3, isShow: !isAuthenticated},
    {title: 'Insights & Inspiration', url: 'insights', key: 4, isShow: !isAuthenticated},
    {title: 'What is Gif-t?', url: 'articles', key: 5, isShow: true},
    {title: 'Homepage', url: '', key: 6, isShow: true},
]

export const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function isValidEmail(email) {
  return emailRegex.test(email);
}