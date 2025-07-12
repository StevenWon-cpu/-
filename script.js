// --- 상수 및 변수 선언 ---
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const nameInput = document.getElementById('name-input');
const gradeInput = document.getElementById('grade-input');
const userInfoDisplay = document.getElementById('user-info-display');

const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const submitButtons = document.querySelectorAll('.password-submit');

// 게임 상태 및 플레이어 위치 변수
let isGameStarted = false;
let playerPositionX = 380;
let playerPositionBottom = 0;
const playerSpeed = 10;
let currentRoom = 1;

// 비밀번호 및 문 잠금 상태 객체
const passwords = {};
const isDoorUnlocked = {};

// 힌트 순서 단어
const positionWords = ["첫", "두", "세", "네"];


// --- 이벤트 리스너 ---

// 1. 게임 시작 버튼 클릭
startButton.addEventListener('click', () => {
    if (nameInput.value.trim() === '' || gradeInput.value.trim() === '') {
        alert('학년과 이름을 모두 입력해주세요.');
        return;
    }
    userInfoDisplay.textContent = `${gradeInput.value} ${nameInput.value}`;
    startScreen.style.display = 'none';
    setupGame();
    isGameStarted = true;
});


// 2. 키보드 이벤트: 플레이어 이동 및 충돌 감지
document.addEventListener('keydown', (e) => {
    if (!isGameStarted) return;

    if (e.key === 'a' || e.key === 'A') playerPositionX -= playerSpeed;
    else if (e.key === 'd' || e.key === 'D') playerPositionX += playerSpeed;
    else if (e.key === 'w' || e.key === 'W') playerPositionBottom += playerSpeed;
    else if (e.key === 's' || e.key === 'S') playerPositionBottom -= playerSpeed;

    playerPositionX = Math.max(0, Math.min(playerPositionX, gameContainer.offsetWidth - player.offsetWidth));
    playerPositionBottom = Math.max(0, Math.min(playerPositionBottom, gameContainer.offsetHeight - player.offsetHeight));

    player.style.left = playerPositionX + 'px';
    player.style.bottom = playerPositionBottom + 'px';

    checkDoorCollision();
});


// 3. 클릭 이벤트 위임: 프롬프트 처리
gameContainer.addEventListener('click', (e) => {
    if (!isGameStarted || !e.target.classList.contains('prompt')) return;
    
    const clickedPrompt = e.target;
    
    if (isColliding(player, clickedPrompt)) {
        if (clickedPrompt.dataset.clue) {
            const index = clickedPrompt.dataset.index;
            const clue = clickedPrompt.dataset.clue;
            alert(`${positionWords[index - 1]} 번째 비밀번호 조각: ${clue}`);
        } else {
            alert('아무것도 없는 것 같다.');
        }
    } else {
        alert('너무 멀리 있다.');
    }
});


// 4. 클릭 이벤트: 비밀번호 확인
submitButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (!isGameStarted) return;

        const roomNumber = e.target.dataset.room;
        const passwordInput = document.getElementById(`password-room${roomNumber}`);
        const enteredPassword = passwordInput.value;

        if (enteredPassword === passwords[roomNumber]) {
            isDoorUnlocked[roomNumber] = true;
            alert('철컥! 문이 열린 것 같다. 문으로 가보자.');
            passwordInput.disabled = true;
            button.disabled = true;
        } else {
            alert('비밀번호가 틀렸습니다!');
            passwordInput.value = '';
        }
    });
});


// --- 함수 ---

function isColliding(elem1, elem2) {
    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();
    return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}

function checkDoorCollision() {
    if (!isDoorUnlocked[currentRoom]) return;
    const currentDoor = document.querySelector(`#room${currentRoom} .door`);
    if (currentDoor && isColliding(player, currentDoor)) {
        moveToNextRoom();
    }
}

function setupGame() {
    for (let i = 1; i <= 5; i++) {
        isDoorUnlocked[i] = false;
        generateRoomData(i);
    }
}

function generateRoomData(roomNumber) {
    let newPassword = '';
    for (let i = 0; i < 4; i++) newPassword += Math.floor(Math.random() * 10);
    passwords[roomNumber] = newPassword;

    const room = document.getElementById(`room${roomNumber}`);
    
    const realPrompts = room.querySelectorAll('[data-index]');
    realPrompts.forEach(prompt => {
        prompt.dataset.clue = newPassword.charAt(prompt.dataset.index - 1);
    });

    const fakePromptCount = (roomNumber - 1) * 2 + 2;
    for (let i = 0; i < fakePromptCount; i++) {
        const fakePrompt = document.createElement('div');
        fakePrompt.className = 'prompt';
        fakePrompt.style.top = Math.random() * 540 + 'px';
        fakePrompt.style.left = Math.random() * 740 + 'px';
        room.appendChild(fakePrompt);
    }
}

function moveToNextRoom() {
    if (currentRoom >= 5) {
        showWinScreen();
        return;
    }
    document.getElementById(`room${currentRoom}`).classList.remove('active');
    currentRoom++;
    document.getElementById(`room${currentRoom}`).classList.add('active');
    
    playerPositionX = 380;
    playerPositionBottom = 0;
    player.style.left = playerPositionX + 'px';
    player.style.bottom = playerPositionBottom + 'px';
}

// ▼▼▼ 버그 수정된 부분 ▼▼▼
function showWinScreen() {
    // 이제 innerHTML=''로 모든 것을 지우지 않습니다.
    // 대신, 필요한 요소들을 숨깁니다.
    document.querySelectorAll('.room').forEach(room => room.style.display = 'none');
    player.style.display = 'none'; // 플레이어를 숨김
    userInfoDisplay.style.display = 'none'; // 정보 표시를 숨김

    // 배경을 검게 하고 승리 메시지만 보여줍니다.
    gameContainer.style.backgroundColor = 'black';
    const winMessageContainer = document.getElementById('win-message');
    winMessageContainer.textContent = `${userInfoDisplay.textContent}님, 탈출 성공!`;
    winMessageContainer.style.display = 'block';
}