class BlackjackGame {
    constructor(playerId) {
        this.playerId = playerId;
        this.deck = this.createDeck();
        this.playerCards = [];
        this.dealerCards = [];
        this.isGameOver = false;
        this.result = '';

        this.dealInitialCards();
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let deck = [];
    
        for (let suit of suits) {
            for (let value of values) {
                deck.push({
                    suit,
                    value
                });
            }
        }
        
        return this.shuffleDeck(deck);
    }
    
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    dealCard() {
        return this.deck.pop();
    }

    getCardValue(card) {
        if (['J', 'Q', 'K'].includes(card.value)) return 10;
        if (card.value === 'A') return 11;
        return parseInt(card.value, 10);
    }

    getHandValue(hand) {
        let value = hand.reduce((sum, card) => sum + this.getCardValue(card), 0);
        let aceCount = hand.filter(card => card.value === 'A').length;

        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }

    dealInitialCards() {
        this.playerCards.push(this.dealCard());
        this.dealerCards.push(this.dealCard());
        this.playerCards.push(this.dealCard());
        this.dealerCards.push(this.dealCard());
    }

    playerHit() {
        if (!this.isGameOver) {
            this.playerCards.push(this.dealCard());
            const playerValue = this.getHandValue(this.playerCards);

            if (playerValue > 21) {
                this.result = 'You bust! Dealer wins.';
                this.isGameOver = true;
                games.clear();
            } else if (playerValue === 21) {
                this.result = 'Blackjack! You win!';
                this.isGameOver = true;
                games.clear();
            }
        }
    }

    dealerPlay() {
        if (!this.isGameOver) {
            while (this.getHandValue(this.dealerCards) < 17) {
                this.dealerCards.push(this.dealCard());
            }

            const dealerValue = this.getHandValue(this.dealerCards);
            const playerValue = this.getHandValue(this.playerCards);

            if (dealerValue > 21) {
                this.result = 'Dealer busts! You win!';
            } else if (playerValue > dealerValue || playerValue === 21) {
                this.result = 'You win!';
            } else if (playerValue < dealerValue || dealerValue === 21) {
                this.result = 'Dealer wins.';
            } else {
                this.result = 'It\'s a tie!';
            }
            this.isGameOver = true;
            games.clear();
        }
    }
}


const games = new Map();

function playBlackjack(playerId) {
    if (!games.has(playerId)) {
        games.set(playerId, new BlackjackGame(playerId));
    }
    return games.get(playerId);
}

function calculateHandTotal(cards) {
    let total = 0;
    let aces = 0;

    for (const card of cards) {
        if (card.value === 'A') {
            aces += 1;
            total += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            total += 10;
        } else {
            total += parseInt(card.value);
        }
    }

    while (total > 21 && aces) {
        total -= 10;
        aces -= 1;
    }

    return total;
}

module.exports = { playBlackjack, calculateHandTotal };
