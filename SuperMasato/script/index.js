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

function atariJudge() {
  v[0] = v["player_x"] / 40;
  v[1] = v["player_y"] / 40;
  // Playerからみて周囲1マスの判定を行う
  for(i=v[0]-2; i<v[0]+2; i++) {
    for(j=v[1]-2; j<v[1]+2; j++) {
      if(i >= 0 && j >= 0 && i <= 100 && j <= 100) {
        /** 背景当たり判定 */
        v["tmp_map_id"] = m[i][j];
        v["tmp_x"] = i * 40;
        v["tmp_y"] = j * 40;
        if(v["tmp_map_id"] == 2) {
          atariJudgeBlock();
        }
      }
    }
  }
  // アイテム当たり判定
  for(i=0; i<LENGTH(v["item"]); i++) {
    v["tmp_obj_id"] = v["item"][i]["id"];
    v["tmp_x"] = v["item"][i]["x"];
    v["tmp_y"] = v["item"][i]["y"];
    if(v["item"][i]["exist"]) {
      atariJudgeObject();
    }
  }
}

/**
 * 1ブロックの当たり判定
 * v["tmp_x"]: ブロックX座標（左上）
 * v["tmp_y"]: ブロックY座標（左上）
 * v["tmp_obj_id"]: あたったObjectのID
 * i: アイテム配列・敵配列のIndex番号
 **/
function atariJudgeObject() {
  if(
    v["player_x"] + v["BLOCK_SIZE"] > v["tmp_x"] &&
    v["player_x"] < v["tmp_x"] + v["BLOCK_SIZE"] &&
    v["player_y"] + v["BLOCK_SIZE"] > v["tmp_y"] &&
    v["player_y"] < v["tmp_y"] + v["BLOCK_SIZE"]
  ) {
    v["tmp_player_center_x"] = v["player_x"] + v["BLOCK_SIZE"] / 2;
    v["tmp_player_center_y"] = v["player_y"] + v["BLOCK_SIZE"] / 2;
    v["tmp_block_center_x"] = v["tmp_x"] + v["BLOCK_SIZE"] / 2;
    v["tmp_block_center_y"] = v["tmp_y"] + v["BLOCK_SIZE"] / 2;
    v["tmp_dx"] = v["tmp_player_center_x"] - v["tmp_block_center_x"];
    v["tmp_dy"] = v["tmp_player_center_y"] - v["tmp_block_center_y"];
    /** チェリーゲット */
    if(v["tmp_obj_id"] == 4) {
      GD += 1;
      SOUND(14);
      v["item"][i]["exist"] = false;
    }
    /** Suicaゲット */
    if(v["tmp_obj_id"] == 5) {
      GD += 10;
      SOUND(14);
      v["item"][i]["exist"] = false;
    }
  }
}

/**
 * 1ブロックの当たり判定
 * v["tmp_x"]: ブロックX座標（左上）
 * v["tmp_y"]: ブロックY座標（左上）
 **/
function atariJudgeBlock() {
  if(
      v["player_x"] + v["BLOCK_SIZE"] > v["tmp_x"] &&
      v["player_x"] < v["tmp_x"] + v["BLOCK_SIZE"] &&
      v["player_y"] + v["BLOCK_SIZE"] > v["tmp_y"] &&
      v["player_y"] < v["tmp_y"] + v["BLOCK_SIZE"]
  ) {
    v["tmp_player_center_x"] = v["player_x"] + v["BLOCK_SIZE"] / 2;
    v["tmp_player_center_y"] = v["player_y"] + v["BLOCK_SIZE"] / 2;
    v["tmp_block_center_x"] = v["tmp_x"] + v["BLOCK_SIZE"] / 2;
    v["tmp_block_center_y"] = v["tmp_y"] + v["BLOCK_SIZE"] / 2;
    v["tmp_dx"] = v["tmp_player_center_x"] - v["tmp_block_center_x"]
    v["tmp_dy"] = v["tmp_player_center_y"] - v["tmp_block_center_y"]
    
    /** 左右衝突 */
    if(ABS(v["tmp_dx"]) > ABS(v["tmp_dy"])) {
      /** 右から */
      if(v["tmp_dx"] > 0) {
        v["player_x"] = v["tmp_x"] + v["BLOCK_SIZE"];
        v["player_vx"] = 0;
      }
      /** 左から */
      else {
        v["player_x"] = v["tmp_x"] - v["BLOCK_SIZE"];
        v["player_vx"] = 0;
      }
    }
    else {
      /** 下から */
      if(v["tmp_dy"] > 0) {
        v["player_y"] = v["tmp_y"] + v["BLOCK_SIZE"];
        v["player_vy"] = 0;
      }
      /** 上から */
      else {
        v["player_y"] = v["tmp_y"] - v["BLOCK_SIZE"];
        v["player_vy"] = 0;
        v["player_is_jump"] = false;
      }
    }
  }
}

/** 画面の描画をする */
function pictureFrame() {
  if(TIME > v["next_picture_frame"]) {
    v["next_picture_frame"] = TIME + 100;
    pictureBackground();
    pictureItem();
    pictureEnemy();
  }
  picturePlayer();
}

/** 背景を描画する */
function pictureBackground() {
  PICTURE(1, {
    pos: [0, 0],
    imgFile: "back",
    size: [440, 440],
    opacity: 100
  });
  v["tmp_back_x"] = (v["player_x"] - v["MASATO_CENTER_X"]) * -1;
  PICTURE(2, {
    pos: [v["tmp_back_x"], 0],
    imgFile: "stage0",
    size: [4040, 440],
    opacity: 100
  });
}

/** アイテムを描画する */
function pictureItem() {
  v[0] = v["player_x"] / 40;
  for(i=0; i<LENGTH(v["item"]); i++) {
    /** アイテム描画は100番代からスタートする */
    v["tmp_idx"] = 100 + i;
    if(
      v["item"][i]["x"] > 0 &&
      v["item"][i]["y"] > 0 &&
      v["item"][i]["x"] <= (100 * v["BLOCK_SIZE"]) &&
      v["item"][i]["y"] <= (100 * v["BLOCK_SIZE"]) &&
      v["item"][i]["exist"]
    ) {
      v["tmp_img_x"] = GET_IMG_POS_X(v["item"][i]["id"], 0);
      v["tmp_img_y"] = GET_IMG_POS_Y(v["item"][i]["id"], 0);
      v["tmp_pic_x"] = v["item"][i]["x"] - v["player_x"] + v["MASATO_CENTER_X"];
      v["tmp_pic_y"] = v["item"][i]["y"];
      PICTURE(v["tmp_idx"], {
        pos: [v["tmp_pic_x"], v["tmp_pic_y"]],
        img: [v["tmp_img_x"], v["tmp_img_y"]],
        size: [40, 40]
      });
    }
    /** 存在しないアイテムは削除する */
    else {
      PICTURE(v["tmp_idx"]);
    }
  }
}

/** 敵の描画をする */
function pictureEnemy() {
  v[0] = v["player_x"] / 40;
  for(i=0; i<LENGTH(v["enemy"]); i++) {
    /** 敵描画は200番代からスタートする */
    v["tmp_idx"] = 200 + i;
    if(
      v["enemy"][i]["x"] > 0 &&
      v["enemy"][i]["y"] > 0 &&
      v["enemy"][i]["x"] <= (100 * v["BLOCK_SIZE"]) &&
      v["enemy"][i]["y"] <= (100 * v["BLOCK_SIZE"]) &&
      v["enemy"][i]["exist"]
    ) {
      v["tmp_img_x"] = GET_IMG_POS_X(v["enemy"][i]["id"], 0, TIME%2);
      v["tmp_img_y"] = GET_IMG_POS_Y(v["enemy"][i]["id"], 0, TIME%2);
      v["tmp_pic_x"] = v["enemy"][i]["x"] - v["player_x"] + v["MASATO_CENTER_X"];
      v["tmp_pic_y"] = v["enemy"][i]["y"];
      PICTURE(v["tmp_idx"], {
        pos: [v["tmp_pic_x"], v["tmp_pic_y"]],
        img: [v["tmp_img_x"], v["tmp_img_y"]],
        size: [40, 40]
      });
    }
    /** 存在しないアイテムは削除する */
    else {
      PICTURE(v["tmp_idx"]);
    }
  }
}

/** マサトを描画する */
function picturePlayer() {
  v["tmp_img_id"] = 1;
  if(v["player_vx"] > 0) {
    v["tmp_img_id"] = 2;
  }
  else if(v["player_vx"] < 0) {
    v["tmp_img_id"] = 3;
  }
  v["tmp_img_x"] = GET_IMG_POS_X(v["tmp_img_id"], 0, TIME%2);
  v["tmp_img_y"] = GET_IMG_POS_Y(v["tmp_img_id"], 0, TIME%2);
  PICTURE(3, {
    pos: [v["MASATO_CENTER_X"], v["player_y"]],
    img: [v["tmp_img_x"], v["tmp_img_y"]],
    size: [40, 40]
  });
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