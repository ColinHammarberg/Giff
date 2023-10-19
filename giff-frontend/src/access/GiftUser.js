
export class GiftUser {
  constructor() {
    this.access_token = null;
    const access_token = localStorage.getItem('access_token');
    if (access_token) {
      this.access_token = access_token;
    }
  }
  isLoggedIn() {
    return this.access_token;
  }
}

const giftUser = new GiftUser();

export default giftUser;
