// @ts-check

/**
 * ダンジョンの基本構造を作成するファイル
 * ダンジョン内のアイテム・敵・扉・罠の設置は「setDungeonObject.js」で行うこと
 **/

// 空き部屋のポジションを決める
function decisionRoomPos() {
  v["tmp"]["x"] = 1 + 5 * RAND(v["DUNGEON_BLOCK_NUM"]);
  v["tmp"]["y"] = 1 + 5 * RAND(v["DUNGEON_BLOCK_NUM"]);
  if(m[v["tmp"]["x"]][v["tmp"]["y"]] == 1 || m[v["tmp"]["x"]][v["tmp"]["y"]] == 3) {
    // 既に空き部屋か壁なら再帰的に決め直す
    decisionRoomPos();
  }
}

/** 
 * 閉路チェックを行う（簡易）
 * 
 * 結果は以下に格納される
 * v["is_closed_circuit"]
 **/
function checkClosedCircuit() {
  // 閉路チェックを開始地点を決定する
  v["tmp"]["ck_st_x"] = -1;
  v["tmp"]["ck_st_y"] = -1;
  v["tmp"]["check_end"] = false;
  for(i=0; i<v["DUNGEON_BLOCK_NUM"]; i++) {
    for(j=0; j<v["DUNGEON_BLOCK_NUM"]; j++) {
      if(m[i * 5 + 3][j * 5 + 3] == 1 && v["tmp"]["check_end"] == false) {
        v["tmp"]["check_end"] = true;
        v["tmp"]["ck_st_x"] = i * 5 + 3;
        v["tmp"]["ck_st_y"] = j * 5 + 3;
      }
    }
  }
  // ループを開始する
  v["tmp"]["current_ck_x"] = v["tmp"]["ck_st_x"];
  v["tmp"]["current_ck_y"] = v["tmp"]["ck_st_y"];
  checkClosedCircuitLoop();
  // ループ終了後のチェック処理
  v["is_closed_circuit"] = true;
  // ループ終了後に仮床が残ってるかを判定
  for(i=0; i<v["DUNGEON_BLOCK_NUM"]; i++) {
    for(j=0; j<v["DUNGEON_BLOCK_NUM"]; j++) {
      // 仮床が残ってればアウトにする
      v["tmp"]["lck_x"] = i * 5 + 3;
      v["tmp"]["lck_y"] = j * 5 + 3;
      if(m[v["tmp"]["lck_x"]][v["tmp"]["lck_y"]] == 1 && v["is_closed_circuit"]) {
        // LOG(`簡易閉路チェックNG: X:${v["tmp"]["lck_x"]} Y:${v["tmtmp_lck_yp_y"]}`)
        v["is_closed_circuit"] = false;
      }
    }
  }
  // 最後に置換しとく
  PARTS(4, 1, 1);
}

/** 閉路チェックを行うループ（簡易） */
function checkClosedCircuitLoop() {
  if(m[v["tmp"]["current_ck_x"]][v["tmp"]["current_ck_y"]] == 1) {
    // 仮床2に置換する
    m[v["tmp"]["current_ck_x"]][v["tmp"]["current_ck_y"]] = 4;
    // 右側移動できるか？
    if(m[v["tmp"]["current_ck_x"] + 2][v["tmp"]["current_ck_y"]] == 1) {
      v["tmp"]["current_ck_x"] += 5;
      checkClosedCircuitLoop();
      v["tmp"]["current_ck_x"] -= 5;
    }
    // 左側移動できるか？
    if(v["tmp"]["current_ck_x"] > 5 && m[v["tmp"]["current_ck_x"] - 3][v["tmp"]["current_ck_y"]] == 1) {
      v["tmp"]["current_ck_x"] -= 5;
      checkClosedCircuitLoop();
      v["tmp"]["current_ck_x"] += 5;
    }
    // 下側移動できるか？
    if(m[v["tmp"]["current_ck_x"]][v["tmp"]["current_ck_y"] + 2] == 1) {
      v["tmp"]["current_ck_y"] += 5;
      checkClosedCircuitLoop();
      v["tmp"]["current_ck_y"] -= 5;
    }
    // 上側移動できるか？
    if(v["tmp"]["current_ck_y"] > 5 && m[v["tmp"]["current_ck_x"]][v["tmp"]["current_ck_y"] - 3] == 1) {
      v["tmp"]["current_ck_y"] -= 5;
      checkClosedCircuitLoop();
      v["tmp"]["current_ck_y"] += 5;
    }
  }
}

/**
 * 閉路チェックを行う（フルチェック）
 * フルチェックは到達できない閉路を壁に置換するときにのみ用いること
 * 通常のチェックでは簡易版（checkClosedCircuit）を利用してください
 * 
 * 以下パラメータがtrueの時には閉路チェック後の後処理を行わない
 * v["is_no_replace_floor"]
 * 
 * 結果は以下に格納される
 * v["is_closed_circuit"]
 **/
function checkFullClosedCircuit() {
  // 閉路が産まれているかをチェック
  v["is_closed_circuit"] = true;
  // 閉路チェックを開始地点を決定する
  v["tmp"]["ck_st_x"] = -1;
  v["tmp"]["ck_st_y"] = -1;
  v["tmp"]["check_end"] = false;
  for(i=0; i<v["DUNGEON_BLOCK_NUM"]*5; i++) {
    for(j=0; j<v["DUNGEON_BLOCK_NUM"]*5; j++) {
      if(m[i][j] == 1 && v["tmp"]["check_end"] == false) {
        v["tmp"]["check_end"] = true;
        v["tmp"]["ck_st_x"] = i;
        v["tmp"]["ck_st_y"] = j;
        // LOG(`CK START POS: X:${v["tmp"]["ck_st_x"]} Y:${v["tmp"]["ck_st_y"]}`)
      }
    }
  }
  // フルスキャンループを開始する
  v["tmp"]["current_ck_x"] = v["tmp"]["ck_st_x"];
  v["tmp"]["current_ck_y"] = v["tmp"]["ck_st_y"];
  checkFullClosedCircuitLoop();
  // ループ終了後に仮床が残ってるかを判定
  for(i=0; i<v["DUNGEON_BLOCK_NUM"]*5; i++) {
    for(j=0; j<v["DUNGEON_BLOCK_NUM"]*5; j++) {
      // 仮床が残ってればアウトにする
      if(m[i][j] == 1) {
        v["is_closed_circuit"] = false;
      }
    }
  }
  // 確認に使用したフロアをもとに戻す
  if(!v["is_no_replace_floor"]) {
    PARTS(4, 1, 1);
  }
}

/** 再帰をすることで進める箇所はチェックを付ける（フルチェック） */
function checkFullClosedCircuitLoop() {
  if(m[v["tmp"]["current_ck_x"]][v["tmp"]["current_ck_y"]] == 1) {
    m[v["tmp"]["current_ck_x"]][v["tmp"]["current_ck_y"]] = 4;
    // X軸方向のチェック
    v["tmp"]["current_ck_x"] += 1;
    checkFullClosedCircuitLoop();
    v["tmp"]["current_ck_x"] -= 2;
    if(v["tmp"]["current_ck_x"] > 0) {
      checkFullClosedCircuitLoop();
    }
    v["tmp"]["current_ck_x"] += 1;
    // Y軸方向のチェック
    v["tmp"]["current_ck_y"] += 1;
    checkFullClosedCircuitLoop();
    v["tmp"]["current_ck_y"] -= 2;
    if(v["tmp"]["current_ck_y"] > 0) {    
      checkFullClosedCircuitLoop();
    }
    v["tmp"]["current_ck_y"] += 1;
  }
}

/** 
 * 対象地点タイプと右・下のタイプを調査する
 * @params v["tmp"]["x"] 調査地点のX座標
 * @params v["tmp"]["y"] 調査地点のY座標
 **/
function checkTargetTypeAndRightDownType() {
  // 対象地点のタイプについて
  v["tmp"]["target_type"] = m[v["tmp"]["x"]+1][v["tmp"]["y"]+1] == 1? "room": "aisle";
  v["tmp"]["right_x"] = v["tmp"]["x"] + 5;
  v["tmp"]["down_y"] = v["tmp"]["y"] + 5;
  // 右側のタイプを調べる
  if(m[v["tmp"]["right_x"]][v["tmp"]["y"]] == 1) {
    if(m[v["tmp"]["right_x"]+1][v["tmp"]["y"]+1] == 1) {
      v["tmp"]["right_type"] = "room";
    }
    else {
      v["tmp"]["right_type"] = "aisle";
    }
  }
  else {
    v["tmp"]["right_type"] = "wall";
  }
  // 下方向へ穴を掘れるか？
  // 下側のタイプを調べる
  if(m[v["tmp"]["x"]][v["tmp"]["down_y"]] == 1) {
    if(m[v["tmp"]["x"]+1][v["tmp"]["down_y"]+1] == 1) {
      v["tmp"]["down_type"] = "room";
    }
    else {
      v["tmp"]["down_type"] = "aisle";
    }
  }
  else {
    v["tmp"]["down_type"] = "wall";
  }
}

/**
 * 通路開通・閉鎖共通関数
 * @params v["tmp"]["x"] 開始地点のX座標
 * @params v["tmp"]["y"] 開始地点のY座標
 * @params v["tmp"]["is_right"] 右方向へ掘るか？
 */
function openOrClosedAisle() {
  // 右側通路解放
  if(v["tmp"]["is_right"]) {
    if(v["tmp"]["right_type"] != "wall") {
      v["tmp"]["start_idx"] = v["tmp"]["target_type"] == "aisle"? 1: 2;
      v["tmp"]["open_size"] = v["tmp"]["right_type"] == "aisle"? 5: 3;
      for(k=v["tmp"]["start_idx"]; k<v["tmp"]["open_size"]; k++) {
        m[v["tmp"]["x"] + k][v["tmp"]["y"]] = v["tmp"]["set_foor_number"]; 
      }
    }
  }
  // 下側通路解放
  else {
    if(v["tmp"]["down_type"] != "wall") {
      v["tmp"]["start_idx"] = v["tmp"]["target_type"] == "aisle"? 1: 2;
      v["tmp"]["open_size"] = v["tmp"]["down_type"] == "aisle"? 5: 3;
      for(k=v["tmp"]["start_idx"]; k<v["tmp"]["open_size"]; k++) {
        m[v["tmp"]["x"]][v["tmp"]["y"] + k] = v["tmp"]["set_foor_number"]; 
      }
    }
  }
}

/** 通路開通 */
function openAisle() {
  v["tmp"]["set_foor_number"] = 1;
  openOrClosedAisle();
}

/** 右側の通路開通 */
function openAisleRight() {
  v["tmp"]["is_right"] = true;
  openAisle();
}

/** 下側の通路開通 */
function openAisleDown() {
  v["tmp"]["is_right"] = false;
  openAisle();
}

/** 通路閉鎖 */
function closedAisle() {
  v["tmp"]["set_foor_number"] = 2;
  openOrClosedAisle();
}

/** 右側の通路閉鎖 */
function closedAisleRight() {
  v["tmp"]["is_right"] = true;
  closedAisle();
}

/** 下側の通路閉鎖 */
function closedAisleDown() {
  v["tmp"]["is_right"] = false;
  closedAisle();
}

/** 通路を閉じまくる */
function closedAside() {
  for(LP[0]=0; LP[0] <= v["DUNGEON_BLOCK_NUM"]; LP[0]++) {
    for(LP[1]=0; LP[1] <= v["DUNGEON_BLOCK_NUM"]; LP[1]++) {
      v["tmp"]["x"] = LP[0] * 5 + 3;
      v["tmp"]["y"] = LP[1] * 5 + 3;
      // 壁に対しては処理をしない
      if(m[v["tmp"]["x"]][v["tmp"]["y"]] == 1) {
        // 対象地点タイプと右・下に通路を作れるか判定
        checkTargetTypeAndRightDownType();
        // LOG(`X: ${v["tmp"]["x"]} Y: ${v["tmp"]["y"]} TYPE: ${v["tmp"]["target_type"]} RIGHT: ${v["tmp"]["right_type"]} DOWN: ${v["tmp"]["down_type"]}`);
        // 右の床を閉鎖する
        if(v["tmp"]["right_type"] != "wall") {
          /** 部屋―部屋が連続しているときには必ず通路を閉じる。それ以外なら1/2の確率で閉じる */
          v["tmp"]["is_close"] = true;
          if(v["tmp"]["target_type"] != "room" || v["tmp"]["right_type"] != "room") {
            v["tmp"]["is_close"] = RAND(2) == 0;
          }
          if(v["tmp"]["is_close"]) {
            closedAisleRight();
            // 閉路チェック
            checkClosedCircuit();
            // 閉鎖により閉路が産まれてしまったら解放
            if(v["is_closed_circuit"] == false) {
              openAisleRight();
            }
          }
        }
        // 下の床を閉鎖する
        if(v["tmp"]["down_type"] != "wall") {
          /** 部屋―部屋が連続しているときには必ず通路を閉じる。それ以外なら1/2の確率で閉じる */
          v["tmp"]["is_close"] = true;
          if(v["tmp"]["target_type"] != "room" || v["tmp"]["down_type"] != "room") {
            v["tmp"]["is_close"] = RAND(3) != 0;
          }
          if(v["tmp"]["is_close"]) {
            closedAisleDown();
            // 閉路チェック
            checkClosedCircuit();
            // 閉鎖により閉路が産まれてしまったら解放
            if(v["is_closed_circuit"] == false) {
              openAisleDown();
            }
          }
        }
      }
    }
  }
}

function initDungeon() {
  // 一旦全部のマスを壁で埋める
  for(i=0; i<=(v["DUNGEON_BLOCK_NUM"] * 5); i++) {
    for(j=0; j<=(v["DUNGEON_BLOCK_NUM"] * 5); j++) {
      m[i][j] = 2;
      // 物体も削除しておく
      o[i][j] = 0;
    }
  }
  // 通路候補地を生成する
  for(i=0; i<v["DUNGEON_BLOCK_NUM"]; i++) {
    for(j=0; j<v["DUNGEON_BLOCK_NUM"]; j++) {
      v["tmp"]["x"] = 3 + 5 * i;
      v["tmp"]["y"] = 3 + 5 * j;
      m[v["tmp"]["x"]][v["tmp"]["y"]] = 1;
    }
  }
  // 壁を生成する
  // 壁の数はダンジョンサイズに比例させる
  v["wall_num"] = RAND(v["DUNGEON_SIZE"] * v["DUNGEON_SIZE"]) + v["DUNGEON_SIZE"];
  for(i=0; i<v["wall_num"]; i++) {
    decisionRoomPos();
    for(j=0; j<4; j++) {
      for(k=0; k<4; k++) {
        m[v["tmp"]["x"] + j][v["tmp"]["y"] + k] = 3;
      }
    }
  }
  // 空き部屋を作る数を決める
  v["room_num"] = RAND(v["DUNGEON_SIZE"] * v["DUNGEON_SIZE"]) + v["DUNGEON_SIZE"];
  for(i=0; i<v["room_num"]; i++) {
    decisionRoomPos();
    for(j=0; j<4; j++) {
      for(k=0; k<4; k++) {
        m[v["tmp"]["x"] + j][v["tmp"]["y"] + k] = 1;
      }
    }
  }
  // 通路を掘り進める
  for(i=0; i<(v["DUNGEON_BLOCK_NUM"]); i++) {
    for(j=0; j<v["DUNGEON_BLOCK_NUM"]; j++) {
      v["tmp"]["x"] = i * 5 + 3;
      v["tmp"]["y"] = j * 5 + 3;
      if(m[v["tmp"]["x"]][v["tmp"]["y"]] == 1) {
        // 対象地点タイプと右・下に通路を作れるか判定
        checkTargetTypeAndRightDownType();
        // 右方向へ通路を延ばす
        openAisleRight();
        // 下方向へ通路を延ばす
        v["tmp"]["is_right"] = false;
        openAisleDown();
      }
    }
  }
  /** 1回目の閉路チェックを行う */
  v["is_no_replace_floor"] = true;
  checkFullClosedCircuit();
  // 到達できない地点は壁で埋める
  PARTS(1, 2, 1);
  // 仮床2を仮床1に戻す
  PARTS(4, 1, 1);
  v["is_no_replace_floor"] = false;
  /** 通路を閉じまくる */
  closedAside();
  // 仮壁を壁に置換する
  PARTS(3, 2, 1);
}

/** 部屋の数をチェックします */
function checkRooms() {
  v["dungeon_rooms"] = [];
  for(i=0; i<v["DUNGEON_BLOCK_NUM"]; i++) {
    for(j=0; j<v["DUNGEON_BLOCK_NUM"]; j++) {
      v["tmp"]["x"] = i * 5 + 4;
      v["tmp"]["y"] = j * 5 + 4;
      if(m[v["tmp"]["x"]][v["tmp"]["y"]] == 1) {
        v["rooms_len"] = LENGTH(v["dungeon_rooms"]);
        v["dungeon_rooms"][v["rooms_len"]] = {
          x: (i * 5),
          y: (j * 5)
        }
      }
    }
  }
  /** 部屋の数が2個以下の場合にはダンジョンとして成立させない */
  if(LENGTH(v["dungeon_rooms"]) < 3) {
    // LOG("dungeon_rooms: "+LENGTH(v["dungeon_rooms"]))
    v["tmp"]["able_dungeon"] = false;
  }
}

/** 生成したダンジョンについて壁に影をつける */
function addCastShadow() {
  for(i=0; i<=(v["DUNGEON_BLOCK_NUM"]*5); i++) {
    for(j=0; j<=(v["DUNGEON_BLOCK_NUM"]*5); j++) {
      // 該当マスが壁かつ下のマスが床なら影付きの壁に変える
      if(m[i][j] == 2 && m[i][j+1] == 1) {
        m[i][j] = v["target_dwfi"]["wall_id"];
      }
    }
  }
}

/**
 * ランダムダンジョンを作成する
 * 以下の処理を完了してから呼ぶこと
 * v["dungeon_level"]: インクリメント
 * v["target_dwfi"]
 * v["DUNGEON_SIZE"]
 * v["DUNGEON_BLOCK_NUM"]: 確定
 */
function createRandomDungeon() {
  v["able_dungeon"] = false;
  for(LP[2] = 0; LP[2] < 100; LP[2]++) {
    // ダンジョンとして成立するまでマップ作成をやり直す
    v["tmp"]["able_dungeon"] = true;
    initDungeon();
    checkRooms();
    if(v["tmp"]["able_dungeon"]) {
      v["able_dungeon"] = true;
      break;
    }
    else {
      LOG("ダンジョンとして成立しないので処理をやり直します。");
    }
  }
  /** 壁をセットする */
  addCastShadow();
  v["player_start_room_idx"] = 0;
  /** 下り階段の位置 */
  v["down_room_idx"] = RAND(LENGTH(v["dungeon_rooms"]) - 1) + 1;
  /** 下り階段を設置する */
  m[v["dungeon_rooms"][v["down_room_idx"]]["x"] + 3][v["dungeon_rooms"][v["down_room_idx"]]["y"] + 3] = v["target_dwfi"]["stairs_id"];
  // プレイヤー開始地点識別床を設置する
  m[v["dungeon_rooms"][v["player_start_room_idx"]]["x"] + 3][v["dungeon_rooms"][v["player_start_room_idx"]]["y"] + 3] = 6;
  // 仮床を床に置換する
  PARTS(1, v["target_dwfi"]["floor_id"], 1);
  // プレイヤー開始地点識別床を床に置換する
  PARTS(6, v["target_dwfi"]["floor_id"], 1);
  /** プレイヤーをゲーム開始位置に飛ばす */
  JUMPGATE(
    v["dungeon_rooms"][v["player_start_room_idx"]]["x"] + 3,
    v["dungeon_rooms"][v["player_start_room_idx"]]["y"] + 3
  )
  // /** ダンジョン作成後の共通処理 */
  // afterCreateRandomDungeon();
}
