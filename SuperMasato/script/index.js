/** 初期画面 */
function initGame() {
  v["game_mode"] = "loading";
  v["accept_key_next_frame"] = 0;
  v["next_picture_frame"] = 0;
  v["next_atari_frame"] = 0;
  v["BLOCK_SIZE"] = 40;
  v["MASATO_CENTER_X"] = 200;
  DEL_PLAYER(1);
  v["stage"] = -1;
  HP = 10;
  v["game_mode"] = "title";
  v["start_pos"] = {
    "x": 200,
    "y": 360
  }
}

/** 1フレームごとに処理が呼ばれる */
function frame() {
  if(v["game_mode"] == "play") {
    /** 真下にブロックが無い場合もあるので落下中にしとく */
    v["player_is_jump"] = true;
    // 当たり判定
    atariJudge();
    /** プレイヤーを動かす */
    moverPlayer();
    /** 敵を動かす */
    moveEnemy();
    /** 色々描画する */
    pictureFrame();
    /** タイムを減らす */
    if(v["next_time_frame"] < TIME) {
      v["next_time_frame"] = TIME + 100;
      DF -= 1;
      /** タイムオーバー */
      if(DF <= 0) {
        miss();
      }
    }
  }
  /** タイトル画面 */
  if(v["game_mode"] == "title") {
    /** タイトル画面 */
    PICTURE(1000, {
      pos: [0, 0],
      imgFile: "title",
      size: [440, 440],
      opacity: 100
    });
    PICTURE(1001, {
      pos: [150, 100],
      text: "STAGE " + (v["stage"] + 2),
      font: "36px sans-serif",
      color: [0, 0, 0]
    });
  }
  /** gameover画面 */
  else if(v["game_mode"] == "gameover") {
    /** gameover画面 */
    PICTURE(1000, {
      pos: [0, 0],
      imgFile: "gameover",
      size: [440, 440],
      opacity: 100
    });
  }
  /** ゲームクリア */
  else if(v["game_mode"] == "gameClear") {
    PICTURE(1000, {
      pos: [0, 0],
      imgFile: "clear",
      size: [440, 440],
      opacity: 100
    });
    v["score"] = (HP * 100) + (DF / 10) + GD;
    PICTURE(1001, {
      pos: [220, 140],
      text: "SCORE: " + v["score"],
      font: "36px sans-serif",
      textAlign: "center",
      color: [0, 0, 0]
    });
  }
}

/** リスタートゲーム */
function restart() {
  v["player_x"] = v["start_pos"]["x"];
  v["player_y"] = v["start_pos"]["y"];
  v["player_vx"] = 0;
  v["player_vy"] = 1;
  v["player_is_jump"] = true;
  v["next_time_frame"] = TIME + 100;
  DF = 1000;
}

/** コンティニュー */
function continueGame() {
  HP = 10;
  GD = 0;
  /** 開始地点をリセット */
  v["start_pos"] = {
    "x": 200,
    "y": 360
  }
  /** ステージはそのまま */
  startStage();
}

/** ゲーム開始 */
function startGame() {
  HP = 10;
  GD = 0;
  /** 開始地点をリセット */
  v["start_pos"] = {
    "x": 200,
    "y": 360
  }
  v["stage"] = 0;
  AT = 1;
  startStage();
}

/** 次のステージに進む */
function nextStage() {
  v["game_mode"] = "loading";
  /** 残りのTIMEがスコアとしてプラスされる */
  GD += (DF / 10);
  v["stage"] += 1;
  AT = v["stage"] + 1;
  /** 開始地点をリセット */
  v["start_pos"] = {
    "x": 200,
    "y": 360
  }
  /** ピクチャを削除 */
  clearPicture();
  startStage();
}

/** ステージ開始 */
function startStage() {
  v["item"] = [];
  v["enemy"] = [];
  loadItem();
  restart();
  PICTURE(1000);
  PICTURE(1001);
  v["game_mode"] = "play";
  /** プレイ中はセーブ禁止 */
  SAVE(1);
}

/** アイテム・敵キャラを読み込む */
function loadItem() {
  for(i=0; i<100; i++) {
    /** 面によって読み込み位置を変える */
    v["tmp_base_y"] = v["stage"] * 20;
    v["diff_y"] = v["tmp_base_y"] * v["BLOCK_SIZE"];
    for(j=v["tmp_base_y"]; j<(v["tmp_base_y"]+11); j++) {
      /** アイテムを読み込む */
      if(o[i][j] == 4 || o[i][j] == 5 || o[i][j] == 9 || o[i][j] == 10 || o[i][j] == 11) {
        v["tmp_idx"] = LENGTH(v["item"]);
        v["item"][v["tmp_idx"]] = {
          id: o[i][j],
          x: i*40,
          y: j*40 - v["diff_y"],
          exist: true
        }
      }
      /** 敵を読み込む */
      if(o[i][j] == 6 || o[i][j] == 7 || o[i][j] == 8) {
        v["tmp_idx"] = LENGTH(v["enemy"]);
        v["tmp_direction"] = 0;
        /** コウモリの場合初期だと上に動く */
        if(o[i][j] == 7) {
          v["tmp_direction"] = 8;
        }
        v["enemy"][v["tmp_idx"]] = {
          id: o[i][j],
          x: i*40,
          y: j*40 - v["diff_y"],
          baseX: i*40,
          baseY: j*40 - v["diff_y"],
          direction: v["tmp_direction"],
          exist: true
        }
      }
    }
  }
}

/** ミスした時 */
function miss() {
  if(HP <= 0) {
    v["game_mode"] = "gameover";
    SAVE(0);
  }
  else {
    HP -= 1;
    SOUND(17);
    restart();
  }
}

function moverPlayer() {
  // 重力
  if(v["player_is_jump"]) {
    v["player_vy"] += 0.2;
  }
  else {
    /** 地面に設置したときは抵抗を受ける */
    if(v["player_vx"] > 0.6) {
      v["player_vx"] -= 0.6;
    }
    else if(v["player_vx"] < -0.6) {
      v["player_vx"] += 0.6;
    }
    else {
      v["player_vx"] = 0;
    }
  }
  /** Player移動 */
  v["player_x"] += v["player_vx"];
  v["player_y"] += v["player_vy"];
  /** 小数点切り捨て */
  v[0] = v["player_x"];
  v["player_x"] = v[0];
  v[0] = v["player_y"];
  v["player_y"] = v[0];
  /** 左には行けないようにする */
  if(v["player_x"] < 0) {
    v["player_x"] = 0;
    v["player_vx"] = 0;
  }
  /** 右には行けないようにする */
  else if(v["player_x"] > 4000) {
    v["player_x"] = 4000;
    v["player_vx"] = 0;
  }
  /** 穴に落ちた時 */
  if(v["player_y"] > 440) {
    miss();
  }
  v["player_x"] *= 1;
  v["player_y"] *= 1;
}

/** 敵の動き */
function moveEnemy() {
  for(i=0; i<LENGTH(v["enemy"]); i++) {
    if(v["enemy"][i]["exist"]) {
      /** コウモリさん */
      if(v["enemy"][i]["id"] == 7) {
        /** 上に動くモード */
        if(v["enemy"][i]["direction"] == 8) {
          v["enemy"][i]["y"] -= 2;
        }
        /** 下に動くモード */
        else if(v["enemy"][i]["direction"] == 2) {
          v["enemy"][i]["y"] += 2;
        }
        /** 規定位置より160px移動したら下に動く */
        if(v["enemy"][i]["baseY"] - v["enemy"][i]["y"] > 160) {
          v["enemy"][i]["direction"] = 2;
        }
        /** 規定位置まで下ったら上に動く */
        if(v["enemy"][i]["baseY"] - v["enemy"][i]["y"] < 0) {
          v["enemy"][i]["direction"] = 8;
        }
      }
      /** ハッチ */
      if(v["enemy"][i]["id"] == 8) {
        v["enemy"][i]["x"] += (RAND(11) - 5);
        v["enemy"][i]["y"] += (RAND(11) - 5);
      }
      /** 左には行けないようにする */
      if(v["enemy"][i]["x"] < 0) {
        v["enemy"][i]["x"] = 0;
      }
      /** 右には行けないようにする */
      else if(v["enemy"][i]["x"] > 4000) {
        v["enemy"][i]["x"] = 4000;
      }
      /** 上に行けないようにする */
      if(v["enemy"][i]["y"] < -40) {
        v["enemy"][i]["y"] = -40;
        /** 上に移動中だったら反転させる */
        if(v["enemy"][i]["direction"] == 8) {
          v["enemy"][i]["direction"] = 2;
        }
      }
      /** 下に行けないようにする */
      if(v["enemy"][i]["y"] > 440) {
        v["enemy"][i]["y"] = 440;
        /** 下に移動中だったら反転させる */
        if(v["enemy"][i]["direction"] == 2) {
          v["enemy"][i]["direction"] = 8;
        }
      }
    }
  }
}

/** ジャンプする */
function jumpPlayer() {
  if(!v["player_is_jump"]) {
    v["player_vy"] = -8;
    v["player_is_jump"] = true;
    SOUND(12);
  }
}

function movePlayerLeft() {
  v["player_vx"] -= 0.2;
  if(v["player_vx"] < -5) {
    v["player_vx"] = -5;
  }
}

function movePlayerRight() {
  v["player_vx"] += 0.2;
  if(v["player_vx"] > 5) {
    v["player_vx"] = 5;
  }
}