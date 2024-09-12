function initGame() {
  v["accept_key_next_frame"] = 0;
  v["next_picture_frame"] = 0;
  v["BLOCK_SIZE"] = 40;
  v["MASATO_CENTER_X"] = 200;
  DEL_PLAYER(1);
  restart();
}

function frame() {
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

function miss() {
  HP -= 1;
  SOUND(17);
  restart();
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
        /** Object判定 */
        v["tmp_obj_id"] = o[i][j];
        if(v["tmp_obj_id"] != 0) {
          atariJudgeObject();
        }
      }
    }
  }
}

/**
 * 1ブロックの当たり判定 (object)
 * v["tmp_x"]: ブロックX座標（左上）
 * v["tmp_y"]: ブロックY座標（左上）
 * v["tmp_obj_id"]: あたったObjectのID
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
      o[i][j] = 0;
      SOUND(14);
    }
    /** Suicaゲット */
    if(v["tmp_obj_id"] == 5) {
      GD += 10;
      o[i][j] = 0;
      SOUND(14);
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
  for(i=0; i<12; i++) {
    for(j=0; j<12; j++) {
      v["tmp_x"] = v[0] - 5 + i;
      v["tmp_y"] = j;
      if(v["tmp_x"] > 0 && v["tmp_y"] > 0 && v["tmp_x"] <= 100 && v["tmp_y"] <= 100) {
        v["tmp_obj_id"] = o[v["tmp_x"]][v["tmp_y"]];
        v["tmp_idx"] = 100 + (i * 12) + j;
        v["tmp_img_x"] = GET_IMG_POS_X(v["tmp_obj_id"], 0);
        v["tmp_img_y"] = GET_IMG_POS_Y(v["tmp_obj_id"], 0);
        if(v["tmp_obj_id"] == 4 || v["tmp_obj_id"] == 5) {
          v["tmp_pic_x"] = (v["tmp_x"] * 40) - v["player_x"] + v["MASATO_CENTER_X"];
          v["tmp_pic_y"] = v["tmp_y"] * 40;
          PICTURE(v["tmp_idx"], {
            pos: [v["tmp_pic_x"], v["tmp_pic_y"]],
            img: [v["tmp_img_x"], v["tmp_img_y"]],
            size: [40, 40]
          });
        }
        else {
          PICTURE(v["tmp_idx"]);
        }
      }
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

/** ランダムジャンプ */
function randomJumpPlayer() {
  if(!v["player_is_jump"]) {
    v["player_vy"] = -1 * RAND(12);
    v["player_is_jump"] = true;
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