let players = []

function player(genome) {
    this.brain = genome;
    this.brain.score = 0;

    this.wins = 0;
    this.losses = 0;
    this.ties = 0;
    this.bj = 0;
    this.is_scored = false;

    this.deck = [];
    this.player_hand = [];
    this.dealer_hand = [];

    players.push(this);
}

player.prototype = {
    create_deck: function () {
        const suits = ['♠', '♣', '♥', '♦'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];

        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push({ rank, suit });
            }
        }

        return deck;
    },
    shuffle_deck: function (deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    },
    calculate_hand_value: function (hand) {
        let value = 0;
        let hasAce = false;

        for (let card of hand) {
            if (card.rank === 'A') {
                value += 11;
                hasAce = true;
            } else if (card.rank === 'K' || card.rank === 'Q' || card.rank === 'J') {
                value += 10;
            } else {
                value += parseInt(card.rank);
            }
        }

        if (value > 21 && hasAce) {
            value -= 10;
        }

        return value;
    },
    has_bj: function (hand) {
        return hand.length === 2 && this.calculate_hand_value(hand) === 21;
    },
    main: function () {
        for (let x = 0; x <= 75; x++) {
            this.is_scored = false
            this.dealer_hand = []
            this.player_hand = []
            this.deck = this.create_deck();
            for (let i = 0; i <= 25; i++) {
                this.shuffle_deck(this.deck);
            }
            this.dealer_hand = [this.deck.pop(), this.deck.pop()];
            this.player_hand = [this.deck.pop(), this.deck.pop()];
            if (this.has_bj(this.player_hand)) {
                this.wins++;
                this.bj++
                this.is_scored = true
                continue;
            }
            //Now PLayer Either Hit or Stand
            const dealer_turn = () => {
                while (this.calculate_hand_value(this.dealer_hand) < this.calculate_hand_value(this.player_hand)) {
                    this.dealer_hand.push(this.deck.pop())
                    if (this.calculate_hand_value(this.dealer_hand) < 21 && this.is_scored == false) {
                        this.wins++
                        this.is_scored = true
                    }
                }
                if (this.calculate_hand_value(this.dealer_hand) > this.calculate_hand_value(this.player_hand) && this.is_scored == false) {
                    this.losses++
                    this.is_scored == true
                } else if (this.calculate_hand_value(this.dealer_hand) < this.calculate_hand_value(this.player_hand) && this.is_scored == false) {
                    this.wins++
                    this.is_scored == true
                } else if (this.calculate_hand_value(this.dealer_hand) == this.calculate_hand_value(this.player_hand) && this.is_scored == false) {
                    this.ties++
                    this.is_scored == true
                }
            }
            const handle_input = () => {
                let output = this.brain.activate([this.calculate_hand_value([this.dealer_hand[0]]) / 30, this.calculate_hand_value(this.player_hand) / 30]);

                if (output > .5) {
                    this.player_hand.push(this.deck.pop())
                    if (this.calculate_hand_value(this.player_hand) > 21) {
                        this.losses++
                    } else {
                        handle_input()
                    }
                } else {
                    dealer_turn();
                }
            }
            handle_input()
        }
        this.brain.score = (this.wins * 2) + this.bj - this.losses
        console.log("win:" + this.wins, "loss:" + this.losses, "ties:" + this.ties, "bj:" + this.bj, "win%:" + (this.wins / 76) * 100);
    }
}
//test setup
let neataptic = require("neataptic")
let Neat = neataptic.Neat
let Methods = neataptic.methods
let neat = new Neat(
    2,
    1,
    null,
    {
        mutation: [
            Methods.mutation.ADD_NODE,
            Methods.mutation.SUB_NODE,
            Methods.mutation.ADD_CONN,
            Methods.mutation.SUB_CONN,
            Methods.mutation.MOD_WEIGHT,
            Methods.mutation.MOD_BIAS,
            Methods.mutation.MOD_ACTIVATION,
            Methods.mutation.ADD_GATE,
            Methods.mutation.SUB_GATE,
            Methods.mutation.ADD_SELF_CONN,
            Methods.mutation.SUB_SELF_CONN,
            Methods.mutation.ADD_BACK_CONN,
            Methods.mutation.SUB_BACK_CONN
        ],
        popsize: 100,
        mutationRate: 0,
        elitism: Math.round(50),
    }
);
for (let i = 0; i <= 100; i++) {
    neat.mutate()
}

function start_eval() {
    players = []
    for (const genome of neat.population) {
        new player(genome).main()
    }
}



function end_eval() {
    console.log('Generation:', neat.generation, '- average score:', neat.getAverage());
    neat.sort();
    var newPopulation = [];
    for (var i = 0; i < neat.elitism; i++) {
        newPopulation.push(neat.population[i]);
    }

    // Breed the next individuals
    for (var i = 0; i < neat.popsize - neat.elitism; i++) {
        newPopulation.push(neat.getOffspring());
    }

    // Replace the old population with the new population
    neat.population = newPopulation;
    neat.mutate();

    neat.generation++;
    start_eval();
}
//100 gens
start_eval()
for(let i = 0;i<=100;i++){
    
    end_eval();
}
