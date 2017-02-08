import { List, Map } from 'immutable'

export const INITIAL_STATE = Map();

function getWinners(vote) {
    if (!vote) return [];
    const [a, b] = vote.get('pair');
    const aVotes = vote.getIn(['tally', a], 0);
    const bVotes = vote.getIn(['tally', b], 0);
    if (aVotes > bVotes) return [a];
    else if (aVotes < bVotes) return [b];
    else return [a, b];
}

export function setEntries(state, entries) {
    return state.set('entries', List(entries));
}

export function next(state) {
    const entries = state.get('entries')
        .concat(getWinners(state.get('vote')));

    if (entries.size === 1) {
        return state.remove('vote')
            .remove('entries')
            .set('winner', entries.first());
    } else {
        return state.merge({
            vote: Map({ 
                round: state.getIn(['vote', 'round'], 0) + 1,
                pair: entries.take(2) 
            }),
            entries: entries.skip(2)
        });
    }

}

function removeVote(voteState, clientId) {
    const prevVote = voteState.getIn(['votes', clientId]);

    if (prevVote) {
        // remove previous vote if exists
        return voteState
            .updateIn(['tally', prevVote], tally => tally - 1)
            .removeIn(['votes', clientId]);
    } else {
        return voteState;
    }
}

function addVote(voteState, entry, clientId) {
    if (voteState.get('pair').includes(entry)) {
        // update tally and also update voters list
        return voteState
            .updateIn(['tally', entry], 0, tally => tally + 1)
            .setIn(['votes', clientId], entry);
    } else {
        return voteState;
    }
}

export function vote(voteState, entry, clientId) {
    return addVote(
        removeVote(voteState, clientId),
        entry,
        clientId
    );
}

export function resetVoting(voteState, clientId) {
    const entries = require('../entries.json');
    const newState = setEntries(new Map(), entries).remove('winner');
    return next(newState);
}