import { setEntries, next, vote, INITIAL_STATE } from './core';

export default function reducer(state = INITIAL_STATE, action) {
    // TODO CHECK ACTION META! or server side validation

    switch (action.type) {
        case 'SET_ENTRIES':
            return setEntries(state, action.entries);
        case 'NEXT':
            return next(state);
        case 'VOTE':
            return state.update('vote',
                voteState => vote(voteState, action.entry, action.clientId));
    }
    return state;
}