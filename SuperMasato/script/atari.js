/** 当たり判定総合 */
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
