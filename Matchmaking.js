const queue = []; // Queue to store parties looking for a game
const parties = {}; // To track parties with leader and members
const games = []; // Store active game rooms
const MAX_PLAYERS_PER_GAME = 10;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Player creates a party
    socket.on('create_party', (partyMembers) => {
        const partyId = `party_${socket.id}`; // Use the leader's ID as party ID
        parties[partyId] = {
            leaderId: socket.id,
            members: partyMembers, // Array of member socket IDs
        };

        // Notify all members about party creation and role assignment
        partyMembers.forEach((memberId) => {
            const isLeader = memberId === socket.id;
            io.to(memberId).emit('party_update', { partyId, isLeader });
        });
    });

    // Only party leader can initiate matchmaking
    socket.on('find_game', (partyId) => {
        const party = parties[partyId];

        if (!party || party.leaderId !== socket.id) {
            socket.emit('error', 'Only the party leader can start matchmaking.');
            return;
        }

        // Add the whole party to the queue
        queue.push(party);
        notifyPartyMembers(party, 'matchmaking_started');

        // Check if we can start a game with the current queue
        if (checkAndStartGame()) {
            console.log('Game started with queued players!');
        }
    });

    socket.on('disconnect', () => {
        removeFromQueueOrParty(socket.id);
        console.log('User disconnected:', socket.id);
    });
});

// Helper Functions
function checkAndStartGame() {
    let playerCount = queue.reduce((sum, party) => sum + party.members.length, 0);

    if (playerCount >= MAX_PLAYERS_PER_GAME) {
        let players = [];
        while (players.length < MAX_PLAYERS_PER_GAME) {
            let party = queue.shift();
            players = players.concat(party.members);
        }

        const gameId = `game_${games.length + 1}`;
        games.push({ id: gameId, players });

        players.forEach((playerId) => {
            io.to(playerId).emit('game_start', { gameId });
        });

        return true;
    }
    return false;
}

function removeFromQueueOrParty(socketId) {
    // Check if the player is in the queue and remove them
    const queueIndex = queue.findIndex(party => party.members.includes(socketId));
    if (queueIndex !== -1) queue.splice(queueIndex, 1);

    // If the player is a party leader, remove the entire party
    for (const [partyId, party] of Object.entries(parties)) {
        if (party.leaderId === socketId) {
            delete parties[partyId];
            break;
        }
    }
}

function notifyPartyMembers(party, event) {
    party.members.forEach((memberId) => {
        io.to(memberId).emit(event);
    });
}

// Start the server
server.listen(3000, () => {
    console.log('Server running on http://54.176.156.52:3000');
});
