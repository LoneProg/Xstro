const { command } = require('../lib');
const { TicTacToe, WordChainGame, TriviaGame } = require('../lib/misc');

const wcg = new WordChainGame();
const ttt = new TicTacToe();
const triviaGame = new TriviaGame();

command(
 {
  pattern: 'wcg',
  desc: 'Word Chain Game',
  type: 'games',
 },
 async (message) => {
  const chatId = message.jid;
  let game = wcg.getGame(chatId);
  if (game && game.status === 'active') return await message.reply('A game is already in progress!');
  const args = message.text.split(' ');
  const difficulty = args[1] && ['easy', 'medium', 'hard'].includes(args[1].toLowerCase()) ? args[1].toLowerCase() : 'medium';
  game = wcg.createGame(chatId, difficulty);
  game.addPlayer(message.sender);
  return await message.reply(`Word Chain Game started (${difficulty} mode)!\n` + `Minimum word length: ${game.minLength} letters\n` + `Time per turn: ${game.turnTime} seconds\n\n` + 'Type "join" to participate. Game starts when at least 2 players join.');
 }
);

command(
 {
  on: 'text',
  dontAddCommandList: true,
 },
 async (message) => {
  const chatId = message.jid;
  const game = wcg.getGame(chatId);
  if (!game) return;
  const text = message.text.toLowerCase();
  if (text === 'join' && game.status === 'waiting') {
   if (game.addPlayer(message.sender)) {
    await message.reply('You joined the game! Waiting for more players...');
    if (game.players.size >= 2) {
     game.start();
     return await message.reply(`Game started! First player ${game.currentPlayer}'s turn.\n` + `Start with any word of at least ${game.minLength} letters.\n` + `You have ${game.turnTime} seconds per turn.`);
    }
   }
   return;
  }
  if (game.status === 'active') {
   const validation = await game.validateTurn(message.sender, text);

   if (!validation.valid) {
    if (validation.skipTurn) {
     game.skipCurrentTurn();
     return await message.reply(`${validation.reason}\n` + `Next player ${game.currentPlayer}'s turn.\n` + `Current word to follow: '${game.lastWord}'\n` + `Time remaining: ${game.getTimeRemainingInCurrentTurn()} seconds`);
    }
    return await message.reply(validation.reason);
   }
   game.makeMove(message.sender, text);
   return await message.reply(`Valid word: ${text}\n` + `Next player ${game.currentPlayer}'s turn.\n` + `Word must start with: '${text[text.length - 1]}'\n` + `Time remaining: ${game.turnTime} seconds`);
  }
 }
);

command(
 {
  pattern: 'ttt',
  desc: 'Tic Tac Toe Game',
  type: 'games',
 },
 async (message) => {
  const chatId = message.chat;
  let game = ttt.getGame(chatId);
  if (game && game.status !== 'ended') return await message.reply('A game is already in progress!\n' + game.renderBoard());
  game = ttt.createGame(chatId);
  const symbol = game.addPlayer(message.sender);
  return await message.reply(`*_TicTacToe Started!_*\n\n1. Use 1-9 to place your mark\n2. Get 3 in a row to win\n\n${message.sender} as ${symbol}\nType "join" to play!\n\n${game.renderBoard()}`);
 }
);

command(
 {
  on: 'text',
  dontAddCommandList: true,
 },
 async (message) => {
  const chatId = message.chat;
  const game = ttt.getGame(chatId);
  if (!game) return;
  const text = message.text.toLowerCase();
  if (text === 'join' && game.status === 'waiting') {
   const symbol = game.addPlayer(message.sender);
   if (symbol) {
    return await message.reply(`${message.sender} joined as ${symbol}\n` + 'Game starts now!\n\n' + `${game.players.X} (X) goes first\n` + game.renderBoard());
   }
   return;
  }
  if (game.status === 'active') {
   const position = parseInt(text);
   if (isNaN(position)) return;
   const result = game.makeMove(message.sender, position);
   if (!result.valid) return await message.reply(result.reason);

   if (result.gameEnd) {
    ttt.deleteGame(chatId);
    if (result.reason === 'win') {
     return await message.reply(`*_Game Over! ${message.sender} wins!_*\n\n` + game.renderBoard());
    } else {
     return await message.reply("*_Game Over! It's a draw!_*\n\n" + game.renderBoard());
    }
   }
   return await message.reply(`${message.sender} placed ${game.currentTurn === 'X' ? 'O' : 'X'} at position ${position}\n` + `${game.players[game.currentTurn]}'s turn (${game.currentTurn})\n\n` + game.renderBoard());
  }
 }
);

command(
 {
  pattern: 'trivia ?(.*)',
  desc: 'Play Trivia Game (easy/medium/hard)',
  type: 'games',
 },
 async (message, match) => {
  const chatId = message.chat;
  const difficulty = match?.toLowerCase();
  if (difficulty === 'end') {
   const result = triviaGame.endGame(chatId);
   return await message.reply(result);
  }
  if (triviaGame.isGameActive(chatId)) return await message.reply('*_A game is already in progress! Answer the current question or use "trivia end" to end it._*');
  if (!['easy', 'medium', 'hard'].includes(difficulty)) return await message.reply('*_Choose difficulty: easy, medium, or hard_*');
  const questionMsg = await triviaGame.startGame(chatId, difficulty);
  await message.reply(questionMsg);
 }
);

command(
 {
  on: 'text',
  dontAddCommandList: true,
 },
 async (message) => {
  const chatId = message.chat;
  if (!triviaGame.isGameActive(chatId)) return;
  const userAnswer = message.text;
  const game = triviaGame.activeGames.get(chatId);
  if (!game) return;
  if (/^[1-4]$/.test(userAnswer)) {
   const selectedAnswer = game.answers[parseInt(userAnswer) - 1];
   const result = triviaGame.checkAnswer(chatId, selectedAnswer);
   await message.reply(result);
   if (result.includes('Correct!')) {
    setTimeout(async () => {
     if (triviaGame.isGameActive(chatId)) {
      const newQuestion = await triviaGame.startGame(chatId, game.difficulty);
      await message.reply(newQuestion);
     }
    }, 2000);
   }
  } else {
   const result = triviaGame.checkAnswer(chatId, userAnswer);
   if (result.includes('Correct!')) {
    await message.reply(result);
    setTimeout(async () => {
     if (triviaGame.isGameActive(chatId)) {
      const newQuestion = await triviaGame.startGame(chatId, game.difficulty);
      await message.reply(newQuestion);
     }
    }, 2000);
   } else if (result.includes('Wrong!')) {
    await message.reply(result);
   }
  }
 }
);
