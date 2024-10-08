function clearPicture() {
  for(i=0; i<1000; i++) {
    PICTURE(i);
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
  /** ステージによって背景が変わる */
  if(v["stage"] == 0) {
    v["backImage"] = "stage0";
  }
  else if(v["stage"] == 1) {
    v["backImage"] = "stage1";
  }
  else if(v["stage"] == 2) {
    v["backImage"] = "stage2";
  }
  PICTURE(2, {
    pos: [v["tmp_back_x"], 0],
    imgFile: v["backImage"],
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
      /** ピクチャ表示は画面内だったらする */
      if(
        v["tmp_pic_x"] > -40 &&
        v["tmp_pic_x"] < 440 &&
        v["tmp_pic_y"] > -40 &&
        v["tmp_pic_y"] < 440
      ) {
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
      v["enemy"][i]["y"] > -1 * v["BLOCK_SIZE"] &&
      v["enemy"][i]["x"] <= (100 * v["BLOCK_SIZE"]) &&
      v["enemy"][i]["y"] <= (11 * v["BLOCK_SIZE"])
    ) {
      v["tmp_pic_x"] = v["enemy"][i]["x"] - v["player_x"] + v["MASATO_CENTER_X"];
      v["tmp_pic_y"] = v["enemy"][i]["y"];
      /** ピクチャ表示は画面内だったらする */
      if(
        v["tmp_pic_x"] > -40 &&
        v["tmp_pic_x"] < 440 &&
        v["tmp_pic_y"] > -40 &&
        v["tmp_pic_y"] < 440
      ) {
        /** 生きていればそのまま描画する */
        if(v["enemy"][i]["exist"]) {
          v["tmp_img_x"] = GET_IMG_POS_X(v["enemy"][i]["id"], 0, TIME%2);
          v["tmp_img_y"] = GET_IMG_POS_Y(v["enemy"][i]["id"], 0, TIME%2);
          PICTURE(v["tmp_idx"], {
            pos: [v["tmp_pic_x"], v["tmp_pic_y"]],
            img: [v["tmp_img_x"], v["tmp_img_y"]],
            size: [40, 40]
          });
        }
        /** 死んでたら潰れた状態で描画する */
        else {
          v["tmp_img_x"] = GET_IMG_POS_X(v["enemy"][i]["id"], 0);
          v["tmp_img_y"] = GET_IMG_POS_Y(v["enemy"][i]["id"], 0);
          PICTURE(v["tmp_idx"], {
            pos: [v["tmp_pic_x"], v["tmp_pic_y"] + 20],
            img: [v["tmp_img_x"], v["tmp_img_y"]],
            size: [40, 20]
          });
        }
      }
      else {
        PICTURE(v["tmp_idx"]);
      }
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
