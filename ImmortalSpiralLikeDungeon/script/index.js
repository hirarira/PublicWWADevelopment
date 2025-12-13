/** WWAを開始した際に呼ばれる関数 */
function CALL_WWA_START() {
  initGame();
}

/** リスタート時に呼ばれる関数 */
function CALL_RESTART() {
  initGame();
}

function initGame() {
  v["DUNGEON_SIZE"] = 3;
  /** ダンジョンの区画数 */
  v["DUNGEON_BLOCK_NUM"] = v["DUNGEON_SIZE"] * 2;
  v["tmp"] = {};
  // ループ上限1万回だと突破するので緩和
  LOOPLIMIT = 1000000;
  v["target_dwfi"] = {
      floor_id: 6,
      wall_id: 7,
      stairs_id: 5,
  }
}
