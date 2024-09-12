/** 1フレームごとに呼ばれる関数 */
function CALL_FRAME() {
  frame();
}

/** WWAを開始した際に呼ばれる関数 */
function CALL_WWA_START() {
  initGame();
}

/** クイックロード時に呼ばれる関数 */
function CALL_QUICKLOAD() {
}

/** リスタート時に呼ばれる関数 */
function CALL_RESTART() {
  initGame();
}

/** パスワードロード時に呼ばれる関数 */
function CALL_PASSWORDLOAD() {
}

/** ゲームオーバー時に呼ばれる関数 */
function CALL_GAMEOVER() {
}

/** 移動時に呼ばれる関数 */
function CALL_MOVE() {
}

/** 右キーを押したときに呼ばれる関数 */
function CALL_PUSH_RIGHT() {
  if(TIME > v["accept_key_next_frame"]) {
    v["accept_key_next_frame"] += 10;
    movePlayerRight();
  }
}

/** 左キーを押したときに呼ばれる関数 */
function CALL_PUSH_LEFT() {
  if(TIME > v["accept_key_next_frame"]) {
    v["accept_key_next_frame"] += 10;
    movePlayerLeft();
  }
}

function CALL_PUSH_DOWN() {
  if(TIME > v["accept_key_next_frame"]) {
  }
}

function CALL_PUSH_UP() {
  if(TIME > v["accept_key_next_frame"]) {
  }
}

function COMMON_INPUT_KEY() {
  if(TIME > v["accept_key_next_frame"]) {
    v["accept_key_next_frame"] += 10;
    if(v["tmp_input_key"] == "A") {
      jumpPlayer();
    }if(v["tmp_input_key"] == "Z") {
      randomJumpPlayer();
    }
  }
}

function CALL_PUSH_A() {
  v["tmp_input_key"] = "A";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_B() {
  v["tmp_input_key"] = "B";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_C() {
  v["tmp_input_key"] = "C";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_D() {
  v["tmp_input_key"] = "D";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_E() {
  v["tmp_input_key"] = "E";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_F() {
  v["tmp_input_key"] = "F";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_G() {
  v["tmp_input_key"] = "G";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_H() {
  v["tmp_input_key"] = "H";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_I() {
  v["tmp_input_key"] = "I";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_J() {
  v["tmp_input_key"] = "J";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_K() {
  v["tmp_input_key"] = "K";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_L() {
  v["tmp_input_key"] = "L";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_M() {
  v["tmp_input_key"] = "M";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_N() {
  v["tmp_input_key"] = "N";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_O() {
  v["tmp_input_key"] = "O";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_P() {
  v["tmp_input_key"] = "P";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_Q() {
  v["tmp_input_key"] = "Q";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_R() {
  v["tmp_input_key"] = "R";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_S() {
  v["tmp_input_key"] = "S";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_T() {
  v["tmp_input_key"] = "T";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_U() {
  v["tmp_input_key"] = "U";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_V() {
  v["tmp_input_key"] = "V";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_W() {
  v["tmp_input_key"] = "W";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_X() {
  v["tmp_input_key"] = "X";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_Y() {
  v["tmp_input_key"] = "Y";
  COMMON_INPUT_KEY();
}

function CALL_PUSH_Z() {
  v["tmp_input_key"] = "Z";
  COMMON_INPUT_KEY();
}
