import { List, Map } from 'immutable';
import { expect } from 'chai';

import { setEntries, next, vote, resetVoting } from '../src/core';

describe('application logic', () => {

    describe('setEntries', () => {

        it('adds the entries to the state', () => {
            const state = Map();
            const entries = ['Trainspotting', '28 Days Later'];
            const nextState = setEntries(state, entries);

            expect(nextState).to.equal(Map({
                entries: List.of('Trainspotting', '28 Days Later')
            }));
        });

    });

    describe('next', () => {

        it('takes the next two entries under vote', () => {
            const state = Map({
                entries: List.of('Trainspotting', '28 Days Later', 'Sunshine')
            });
            const nextState = next(state);

            expect(nextState).to.equal(Map({
                vote: Map({
                    round: 1,
                    pair: List.of('Trainspotting', '28 Days Later')
                }),
                entries: List.of('Sunshine')
            }));
        });

        it('puts winner of current vote back to entries', () => {
            const state = Map({
                vote: Map({
                    round: 1,
                    pair: List.of('Trainspotting', '28 Days Later'),
                    tally: Map({
                        'Trainspotting': 4,
                        '28 Days Later': 2
                    })
                }),
                entries: List.of('Sunshine', 'Millions', '127 Hours')
            });
            const nextState = next(state);

            expect(nextState).to.equal(Map({
                vote: Map({
                    round: 2,
                    pair: List.of('Sunshine', 'Millions')
                }),
                entries: List.of('127 Hours', 'Trainspotting')
            }));
        });

        it('puts both from tied vote back to entries', () => {
            const state = Map({
                vote: Map({
                    round: 10,
                    pair: List.of('Trainspotting', '28 Days Later'),
                    tally: Map({
                        'Trainspotting': 3,
                        '28 Days Later': 3
                    })
                }),
                entries: List.of('Sunshine', 'Millions', '127 Hours')
            });
            const nextState = next(state);

            expect(nextState).to.equal(Map({
                vote: Map({
                    round: 11,
                    pair: List.of('Sunshine', 'Millions')
                }),
                entries: List.of('127 Hours', 'Trainspotting', '28 Days Later')
            }));
        });

        it('marks winner when just one entry left', () => {
            const state = Map({
                vote: Map({
                    round: 1024,
                    pair: List.of('Trainspotting', '28 Days Later'),
                    tally: Map({
                        'Trainspotting': 4,
                        '28 Days Later': 2
                    })
                }),
                entries: List()
            });
            const nextState = next(state);

            expect(nextState).to.equal(Map({
                winner: 'Trainspotting'
            }));
        });

    });

    describe('vote', () => {

        it('creates a tally for the voted entry', () => {
            const voteState = Map({
                round: 1,
                pair: List.of('Trainspotting', '28 Days Later')
            });
            const nextState = vote(voteState, 'Trainspotting', 'clientId1');

            expect(nextState).to.equal(Map({
                round: 1,
                pair: List.of('Trainspotting', '28 Days Later'),
                tally: Map({
                    'Trainspotting': 1
                }),
                votes: Map({
                    clientId1: 'Trainspotting'
                })
            }));
        });

        it('adds to existing tally for the voted entry', () => {
            const voteState = Map({
                round: 1,
                pair: List.of('Trainspotting', '28 Days Later'),
                tally: Map({
                    'Trainspotting': 3,
                    '28 Days Later': 2
                }),
                votes: Map({
                    'client1': 'Trainspotting',
                    'client2': 'Trainspotting',
                    'client3': 'Trainspotting',
                    'client4': '28 Days Later',
                    'client5': '28 Days Later'
                })
            });
            const nextState = vote(voteState, 'Trainspotting', 'client6');

            expect(nextState).to.equal(Map({
                round: 1,
                pair: List.of('Trainspotting', '28 Days Later'),
                tally: Map({
                    'Trainspotting': 4,
                    '28 Days Later': 2
                }),
                votes: Map({
                    'client1': 'Trainspotting',
                    'client2': 'Trainspotting',
                    'client3': 'Trainspotting',
                    'client4': '28 Days Later',
                    'client5': '28 Days Later',
                    'client6': 'Trainspotting'
                })
            }));
        });

        it('ignores vote for invalid entry', () => {
            const voteState = Map({
                round: 1,
                pair: List.of('Trainspotting', '28 Days Later')
            });

            const nextState = vote(voteState);

            expect(nextState).to.equal(Map({
                round: 1,
                pair: List.of('Trainspotting', '28 Days Later')
            }));
        });

    });

    describe('resetVoting', () => {
        it('returns to initial entries and while vote in progress', () => {
            const state = Map({
                vote: Map({
                    round: 100,
                    pair: List.of('BigHero6', 'Zootopia')
                }),
                entries: List.of('Trolls', 'Lala Land')
            });

            const initialEntries = List.of(
                'BigHero6', 'SantaClauze', 
                'Zootopia', 'Kingdom',
                'Trolls', 'Lala Land');
            const nextState = resetVoting(state, initialEntries);

            expect(nextState).to.equal(Map({
                vote: Map({
                    round: 1,
                    pair: List.of('BigHero6', 'SantaClauze')
                }),
                entries: List.of('Zootopia', 'Kingdom', 'Trolls', 'Lala Land')
            }));
        });

        it('returns to initial entries after vote finishes', () => {
            const state = Map({
                winner: 'Passenger'
            });

            const initialEntries = List.of(
                'BigHero6', 'SantaClauze', 
                'Zootopia', 'Kingdom',
                'Trolls', 'Lala Land');
            const nextState = resetVoting(state, initialEntries);

            expect(nextState).to.equal(Map({
                vote: Map({
                    round: 1,
                    pair: List.of('BigHero6', 'SantaClauze')
                }),
                entries: List.of('Zootopia', 'Kingdom', 'Trolls', 'Lala Land')
            }));
        });
    });

});