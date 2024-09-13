/** 初期画面 */
function initGame() {
  v["game_mode"] = "loading";
  v["accept_key_next_frame"] = 0;
  v["next_picture_frame"] = 0;
  v["BLOCK_SIZE"] = 40;
  v["MASATO_CENTER_X"] = 200;
  DEL_PLAYER(1);
  v["game_mode"] = "title";
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
  else if(v["game_mode"] == "title") {
    /** タイトル画面 */
    PICTURE(1, {
      pos: [0, 0],
      imgFile: "title",
      size: [440, 440],
      opacity: 100
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
}

/** リスタートゲーム */
function restart() {
  v["player_x"] = v["MASATO_CENTER_X"];
  v["player_y"] = 360;
  v["player_vx"] = 0;
  v["player_vy"] = 1;
  v["player_is_jump"] = true;
  v["next_time_frame"] = TIME + 100;
  DF = 1000;
}

/** ゲーム開始 */
function startGame() {
  HP = 5;
  GD = 0;
  v["item"] = [];
  v["enemy"] = [];
  loadItem();
  restart();
  PICTURE(1000);
  v["game_mode"] = "play";
}

/** アイテム・敵キャラを読み込む */
function loadItem() {
  for(i=0; i<100; i++) {
    for(j=0; j<11; j++) {
      /** アイテムを読み込む */
      if(o[i][j] == 4 || o[i][j] == 5) {
        v["tmp_idx"] = LENGTH(v["item"]);
        v["item"][v["tmp_idx"]] = {
          id: o[i][j],
          x: i*40,
          y: j*40,
          exist: true
        }
      }
      /** 敵を読み込む */
      if(o[i][j] == 6) {
        v["tmp_idx"] = LENGTH(v["enemy"]);
        v["enemy"][v["tmp_idx"]] = {
          id: o[i][j],
          x: i*40,
          y: j*40,
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
    if(v["player_vx"] > 0.5) {
      v["player_vx"] -= 0.5;
    }
    else if(v["player_vx"] < -0.5) {
      v["player_vx"] += 0.5;
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