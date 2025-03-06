export class CreditCard {
    constructor(id, user_id, card_number, cardholder_name, cvv, expiration_date, balance) {
      this.id = id;
      this.user_id = user_id;
      this.card_number = card_number;
      this.cardholder_name = cardholder_name;
      this.cvv = cvv;
      this.expiration_date = expiration_date;
      this.balance = balance;
    }
  }
  