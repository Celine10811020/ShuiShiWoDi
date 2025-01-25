const gameCodeInput = document.getElementById('gameCode');
const startGameButton = document.getElementById('startGame');
const gameResult = document.getElementById('gameResult');
const playerCountSpan = document.getElementById('playerCount');
const playerWordSpan = document.getElementById('playerWord');
const voteUndercoverButton = document.getElementById('voteUndercover');
const voteSection = document.getElementById('voteSection');
const playerVoteInput = document.getElementById('playerVote');
const confirmVoteButton = document.getElementById('confirmVote');
const identitySection = document.getElementById('identitySection');
const playerIdentity = document.getElementById('playerIdentity');

let gameData = {};

// 開始遊戲按鈕事件
startGameButton.addEventListener('click', () => {
  const gameCode = gameCodeInput.value.trim();
  if (gameCode.length !== 9 || isNaN(gameCode)) {
    alert("請輸入正確的九碼數字編碼！");
    return;
  }

  // 解碼邏輯
  const x1 = parseInt(gameCode[0]); // 第一碼，1~9亂數
  const x2 = parseInt(gameCode[1]); // 第二碼，判定有無白板。偶數：無白板、奇數：有白板
  const playerCount = parseInt(gameCode.slice(2, 4)); // 第三、四碼，遊戲人數。3~20人
  const topicIndex = parseInt(gameCode.slice(4, 7)) % topics.length; // 第五至七碼，題目索引。1~100
  const playerId = parseInt(gameCode.slice(7)); // 最後兩碼，玩家編號。1~20

  if (playerCount < 3 || playerCount > 20) {
    alert("遊戲人數必須在 3 到 20 人之間！");
    return;
  }

  // 選擇題目
  const topic = topics[topicIndex];

  // 計算臥底詞
  const y = parseInt(gameCode.slice(0, 7)); // 前七碼
  const undercoverWordIndex = Math.floor(Math.sqrt(y/7*11 + 13) * 17) % 2; // 判定哪個詞是臥底詞。奇數1、偶數2
  const civilianWord = undercoverWordIndex === 0 ? topic.two : topic.one;
  const undercoverWord = undercoverWordIndex === 0 ? topic.one : topic.two;

  // 計算臥底玩家
  const undercoverPlayerCount = Math.ceil(playerCount / 5); // 每 5 人有 1 名臥底
  const hasWhiteboard = x2 % 2 === 1; // 判斷是否有白板
  const whiteboardCount = hasWhiteboard ? 1 : 0; // 如果有白板，則只有 1 名
  const totalUndercoverCount = undercoverPlayerCount + whiteboardCount; // 總臥底數

  const undercoverPlayers = [];
  const whiteboardPlayers = [];

  for (let i = 0; i < totalUndercoverCount; i++) {
    let baseValue = Math.pow(Math.cbrt(y / 11 * 7) / 19, 3) + i*3; // 根據公式計算基礎值，並加上 i 作偏移
    let playerIndex = Math.floor(baseValue) % playerCount + 1; // 計算玩家編號，確保在 1 ~ playerCount 範圍內

    // 確保玩家編號不重複
    while (undercoverPlayers.includes(playerIndex) || whiteboardPlayers.includes(playerIndex)) {
      playerIndex = ((playerIndex + 1) % playerCount) + 1; // 如果重複，玩家編號加 1，並對 playerCount 取餘
    }

    if (i < whiteboardCount) {
      whiteboardPlayers.push(playerIndex); // 將玩家加入白板列表
    } else {
      undercoverPlayers.push(playerIndex); // 將玩家加入臥底列表
    }
  }

  // 儲存遊戲資料
  gameData = {
    playerCount,
    civilianWord,
    undercoverWord,
    undercoverPlayers,
    whiteboardPlayers,
  };

  // 顯示詞組
  playerCountSpan.textContent = playerCount;
  if (gameData.whiteboardPlayers.includes(playerId)) {
    playerWordSpan.textContent = "恭喜！您是白板～ ";
  } else if (gameData.undercoverPlayers.includes(playerId)) {
    playerWordSpan.textContent = undercoverWord;
  } else {
    playerWordSpan.textContent = civilianWord;
  }
  gameResult.classList.remove('hidden');
});

// 票選臥底按鈕事件
voteUndercoverButton.addEventListener('click', () => {
  voteSection.classList.remove('hidden');
});

// 確認身分按鈕事件
// 確認身分按鈕事件
confirmVoteButton.addEventListener('click', () => {
  const playerVote = parseInt(playerVoteInput.value);
  if (isNaN(playerVote) || playerVote < 1 || playerVote > gameData.playerCount) {
    alert("請輸入有效的玩家編號！");
    return;
  }

  // 判定玩家身分
  const isUndercover = gameData.undercoverPlayers.includes(playerVote);
  const isWhiteboard = gameData.whiteboardPlayers.includes(playerVote);

  if (isWhiteboard) {
    playerIdentity.textContent = `玩家 ${playerVote} 是 白板！`;
  } else if (isUndercover) {
    playerIdentity.textContent = `玩家 ${playerVote} 是 臥底！`;
  } else {
    playerIdentity.textContent = `玩家 ${playerVote} 是 平民！`;
  }

  identitySection.classList.remove('hidden');
});
