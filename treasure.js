  // 存储进度的键名
  const PROGRESS_KEY = 'treasureGameProgress';

  // 读取存储的玩家信息
  function getPlayerInfo() {
    const playerID = localStorage.getItem('playerID');
    const playerName = localStorage.getItem('playerName');
    return { playerID, playerName };
  }

  // 存储玩家信息
  function savePlayerInfo(playerID, playerName) {
    localStorage.setItem('playerID', playerID);
    localStorage.setItem('playerName', playerName);
  }

  // 显示输入表单
  function showInputForm() {
    const inputForm = document.createElement('div');
    inputForm.innerHTML = `
        <h2>请输入您的信息</h2>
        <label for="playerID">玩家 ID:</label>
        <input type="text" id="playerID" placeholder="请输入 ID" required>
        <br>
        <label for="playerName">昵称:</label>
        <input type="text" id="playerName" placeholder="请输入昵称" required>
        <br>
        <button id="savePlayerInfoBtn">保存信息</button>
    `;
    document.body.innerHTML = ''; // 清空页面
    document.body.appendChild(inputForm);

    // 点击保存按钮时，保存玩家信息并直接进入游戏
    document.getElementById('savePlayerInfoBtn').addEventListener('click', () => {
      const playerID = document.getElementById('playerID').value;
      const playerName = document.getElementById('playerName').value;

      if (playerID && playerName) {
        savePlayerInfo(playerID, playerName);
        enterGame(playerID, playerName); // 保存信息并直接进入游戏
      } else {
        alert('请输入有效的玩家 ID 和昵称!');
      }
    });
  }

  // 进入游戏
  function enterGame(playerID, playerName) {
    const progress = getProgress();
    const isGameFinished = progress === 5;
    document.body.innerHTML = `
        <div class="container">
            <h1>寻宝游戏</h1>
            <button id="startButton">开始寻宝</button>
            <button id="resetButton" style="display:none;">重置游戏</button>
            <div id="output"></div>
            <div id="clueOptions" style="display:none;">
                <button id="clue1Button">选择线索 1</button>
                <button id="clue2Button">选择线索 2</button>
            </div>
            <img id="treasureImage" src="" alt="" style="display:none; max-width: 100%; margin-top: 20px;">
        </div>

        <!-- 音乐播放器 -->
        <audio id="backgroundMusic" src="M500001sgC9u3iuANz.mp3" preload="auto" loop></audio>
    `;

    // 显示玩家信息
    const output = document.getElementById('output');
    output.textContent = `欢迎回来, ${playerName}（ID: ${playerID}）！`;

    // 设置开始按钮的事件监听
    document.getElementById("startButton").addEventListener("click", () => findTreasureWithAsyncAwait(isGameFinished));
    document.getElementById("resetButton").addEventListener("click", resetGame);

    if (isGameFinished) {
      resetGame();
    } else if (progress > 0) {
      resumeGame(progress);
    }
  }

  // 游戏的其他部分保持不变
  function playBackgroundMusic() {
    const music = document.getElementById("backgroundMusic");
    console.log("试图播放音乐...");

    if (music.paused) {
      music.play().then(() => {
        console.log("音乐播放成功");
      }).catch((error) => {
        console.error("音乐播放失败: ", error);
      });
    }
  }

  function stopBackgroundMusic() {
    const music = document.getElementById("backgroundMusic");
    music.pause();
    music.currentTime = 0;
    console.log("音乐停止");
  }

  let lines = [];
  async function loadContent() {
    const response = await fetch('content.txt');
    if (!response.ok) {
      throw new Error('文件加载失败');
    }

    const text = await response.text();
    lines = text.split('\n').map(line => line.trim());
    console.log(lines);
  }

  loadContent();

  class TreasureMap {
    static getInitialClue() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(lines[0]);
        }, 1000);
      });
    }

    static chooseClue(clueNumber) {
      switch (clueNumber) {
        case 1:
          return lines[1];
        case 2:
          return lines[2];
        default:
          throw new Error("无效的线索选择!");
      }
    }

    static decodeAncientScript(clue) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!clue) {
            reject("没有线索可以解码!");
          }
          resolve(lines[3]);
        }, 1500);
      });
    }

    static searchTemple(location) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!location) {
            reject("没有找到神庙的位置!");
          }
          resolve(lines[4]);
        }, 2000);
      });
    }

    static solvePuzzle(puzzle) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!puzzle) {
            reject("没有谜题可以解答!");
          }
          resolve(lines[5]);
        }, 1500);
      });
    }

    static openTreasureBox() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(lines[6]);
        }, 1000);
      });
    }

    static getImageForStep(step) {
      switch (step) {
        case 1:
          return "线索.png";
        case 2:
          return "神庙.png";
        case 3:
          return "宝箱.png";
        case 4:
          return "宝藏.png";
        default:
          return "";
      }
    }
  }

  async function findTreasureWithAsyncAwait(isGameFinished) {
    if (isGameFinished) {
      // 如果游戏已经完成，重置进度并重新开始
      setProgress(0);
    }
    playBackgroundMusic();

    const output = document.getElementById("output");
    const treasureImage = document.getElementById("treasureImage");
    const clueOptions = document.getElementById("clueOptions");
    const resetButton = document.getElementById("resetButton");
    const clue1Button = document.getElementById("clue1Button");
    const clue2Button = document.getElementById("clue2Button");
    const startButton = document.getElementById("startButton");

    output.textContent = "";
    treasureImage.style.display = "none";
    clueOptions.style.display = "none";
    resetButton.style.display = "none";
    startButton.style.display = "none";
    let animationDelay = 0;
    let currentStep = getProgress();

    try {
      if (currentStep === 0) {
        const clue = await TreasureMap.getInitialClue();
        displayMessage(output, clue, animationDelay);
        currentStep++;
        setProgress(currentStep);
      }

      if (currentStep === 1) {
        clueOptions.style.display = "block";

        await new Promise((resolve) => {
          clue1Button.onclick = async () => {
            disableClueButtons(clue1Button, clue2Button);
            hideClueButtons(clue1Button, clue2Button);
            const selectedClue = TreasureMap.chooseClue(1);
            await proceedWithClue(selectedClue, output, treasureImage, animationDelay, currentStep);
            resolve();
          };
          clue2Button.onclick = async () => {
            disableClueButtons(clue1Button, clue2Button);
            hideClueButtons(clue1Button, clue2Button);
            const selectedClue = TreasureMap.chooseClue(2);
            await proceedWithClue(selectedClue, output, treasureImage, animationDelay, currentStep);
            resolve();
          };
        });

        resetButton.style.display = "block";
      }

    } catch (error) {
      displayMessage(output, `任务失败: ${error}`, animationDelay);
    }
  }

  async function proceedWithClue(clue, output, treasureImage, animationDelay, currentStep) {
    treasureImage.style.display = "block";
    displayMessage(output, clue, animationDelay);
    treasureImage.src = TreasureMap.getImageForStep(1);

    const location = await TreasureMap.decodeAncientScript(clue);
    displayMessage(output, location, animationDelay += 1.5);
    currentStep++;
    setProgress(currentStep);

    treasureImage.src = TreasureMap.getImageForStep(2);

    const box = await TreasureMap.searchTemple(location);
    displayMessage(output, box, animationDelay += 2);
    currentStep++;
    setProgress(currentStep);

    treasureImage.src = TreasureMap.getImageForStep(3);

    const puzzle = "解开这个谜题才能打开宝箱";
    const puzzleSolved = await TreasureMap.solvePuzzle(puzzle);
    displayMessage(output, puzzleSolved, animationDelay += 1.5);
    currentStep++;
    setProgress(currentStep);

    treasureImage.src = TreasureMap.getImageForStep(4);

    const treasure = await TreasureMap.openTreasureBox();
    displayMessage(output, treasure, animationDelay += 1);
    currentStep++;
    setProgress(currentStep);
  }

  function displayMessage(output, message, delay) {
    output.innerHTML += `<span class="message" style="animation-delay: ${delay}s;">${message}</span>\n`;
  }

  function disableClueButtons(...buttons) {
    buttons.forEach(button => {
      button.disabled = true;
    });
  }

  function hideClueButtons(...buttons) {
    buttons.forEach(button => {
      button.style.display = "none";
    });
  }

  function resetGame() {
    const output = document.getElementById("output");
    const treasureImage = document.getElementById("treasureImage");
    const clueOptions = document.getElementById("clueOptions");
    const resetButton = document.getElementById("resetButton");
    const clue1Button = document.getElementById("clue1Button");
    const clue2Button = document.getElementById("clue2Button");
    const startButton = document.getElementById("startButton");

    output.textContent = "";
    treasureImage.style.display = "none";
    clueOptions.style.display = "none";
    resetButton.style.display = "none";
    startButton.style.display = "inline-block";
    clue1Button.style.display = "inline-block";
    clue2Button.style.display = "inline-block";
    setProgress(0);
  }

  function getProgress() {
    return parseInt(localStorage.getItem(PROGRESS_KEY)) || 0;
  }

  function setProgress(step) {
    localStorage.setItem(PROGRESS_KEY, step);
  }

  function resumeGame(progress) {
    findTreasureWithAsyncAwait(false).then(() => {
      const output = document.getElementById("output");
      const treasureImage = document.getElementById("treasureImage");
      const clueOptions = document.getElementById("clueOptions");
      const resetButton = document.getElementById("resetButton");
      const clue1Button = document.getElementById("clue1Button");
      const clue2Button = document.getElementById("clue2Button");
      const startButton = document.getElementById("startButton");

      switch (progress) {
        case 1:
          clueOptions.style.display = "block";
          break;
        case 2:
          treasureImage.style.display = "block";
          treasureImage.src = TreasureMap.getImageForStep(1);
          break;
        case 3:
          treasureImage.src = TreasureMap.getImageForStep(2);
          break;
        case 4:
          treasureImage.src = TreasureMap.getImageForStep(3);
          break;
        case 5:
          treasureImage.src = TreasureMap.getImageForStep(4);
          break;
      }

      if (progress > 0) {
        startButton.style.display = "none";
        resetButton.style.display = "block";
      }
    });
  }

  // 页面加载时检查是否已有玩家信息
  window.onload = () => {
    const { playerID, playerName } = getPlayerInfo();
    if (playerID && playerName) {
      enterGame(playerID, playerName); // 已存储信息，直接进入游戏
    } else {
      showInputForm(); // 没有信息，显示输入表单
    }
  };