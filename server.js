const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

function luhnCheck() {
    let sum = 0;
    let alternate = false;
    let digits = cardNumber.split('').reverse().map(Number);

    for(let i = 0; i < digits.length; i++){
        let num = digits[i];
        if(alternate){
            num *= 2;
            if(num > 9){
                num -= 9;
            }
        }
        sum += num;
    alternate = !alternate;
    }

    return sum % 10 === 0;

    
}

app.post('/validate-card', (req, res) => {
    const{ card_number, cardholder_name, cvv, expiry_data } = req.body;
    if (!/^\d{16}$/.test(card_number) || !luhnCheck(card_number)){
        return res.status(400).json({ message: 'Invalid card number' });
    }
    
});